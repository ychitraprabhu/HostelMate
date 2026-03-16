const db = require('../db/connection');
const axios = require('axios');

const PAYPAL_API = 'https://api-m.sandbox.paypal.com';
const CONVERSION_RATE = 83; // 1 USD = 83 INR

// Helper to get PayPal Access Token
async function getAccessToken() {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
    const response = await axios({
        url: `${PAYPAL_API}/v1/oauth2/token`,
        method: 'post',
        data: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`
        }
    });
    return response.data.access_token;
}

// Create a booking (student only)
const createBooking = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { hostel_id, room_type_id, start_date } = req.body;
    const student_id = req.user.id; // from JWT token

    await connection.beginTransaction();

    // 1. Check if hostel has available rooms
    const [hostels] = await connection.query('SELECT available_rooms FROM hostels WHERE id = ? FOR UPDATE', [hostel_id]);
    if (hostels.length === 0 || hostels[0].available_rooms <= 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'No rooms available in this hostel.' });
    }

    // 2. Check if specific room type has available count
    const [roomTypes] = await connection.query('SELECT available_count FROM room_types WHERE id = ? FOR UPDATE', [room_type_id]);
    if (roomTypes.length === 0 || roomTypes[0].available_count <= 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Selected room type is not available.' });
    }

    // 3. Create booking
    const [result] = await connection.query(
      `INSERT INTO bookings (student_id, hostel_id, room_type_id, start_date, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [student_id, hostel_id, room_type_id, start_date]
    );

    // 4. Decrease available rooms in hostel
    await connection.query('UPDATE hostels SET available_rooms = available_rooms - 1 WHERE id = ?', [hostel_id]);

    // 5. Decrease available count in room_types (Optional based on schema logic, but good practice if available_count tracks it)
    await connection.query('UPDATE room_types SET available_count = available_count - 1 WHERE id = ?', [room_type_id]);

    await connection.commit();

    res.status(201).json({ 
      message: 'Booking created successfully.', 
      booking_id: result.insertId 
    });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error while creating booking.' });
  } finally {
    connection.release();
  }
};

// Get bookings for logged-in student
const getMyBookings = async (req, res) => {
  try {
    const student_id = req.user.id;
    
    // We can join with hostels and room_types to provide details
    const [bookings] = await db.query(`
      SELECT b.*, h.name as hostel_name, h.owner_id, r.type_name, r.price_per_month 
      FROM bookings b
      JOIN hostels h ON b.hostel_id = h.id
      JOIN room_types r ON b.room_type_id = r.id
      WHERE b.student_id = ?
      ORDER BY b.created_at DESC
    `, [student_id]);
    
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching your bookings.' });
  }
};

// --- Payment Logic ---

const createOrder = async (req, res) => {
    try {
        const { booking_id, amount_inr } = req.body;
        if (!booking_id || !amount_inr) return res.status(400).json({ error: 'booking_id and amount_inr are required' });

        const amountUsd = (amount_inr / CONVERSION_RATE).toFixed(2);
        const accessToken = await getAccessToken();
        const response = await axios({
            url: `${PAYPAL_API}/v2/checkout/orders`,
            method: 'post',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            data: {
                intent: 'CAPTURE',
                purchase_units: [{ amount: { currency_code: 'USD', value: amountUsd }, description: `Booking: ${booking_id}` }]
            }
        });
        res.json({ paypal_order_id: response.data.id });
    } catch (error) {
        console.error('PayPal Order Error:', error.message);
        res.status(500).json({ error: 'Failed to create PayPal order' });
    }
};

const captureOrder = async (req, res) => {
    try {
        const student_id = req.user.id;
        const { paypal_order_id, booking_id } = req.body;
        if (!paypal_order_id || !booking_id) return res.status(400).json({ error: 'paypal_order_id and booking_id are required' });

        const accessToken = await getAccessToken();
        const response = await axios({
            url: `${PAYPAL_API}/v2/checkout/orders/${paypal_order_id}/capture`,
            method: 'post',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });

        if (response.data.status === 'COMPLETED') {
            await db.execute('UPDATE bookings SET status = "confirmed" WHERE id = ?', [booking_id]);
            const [bookings] = await db.execute('SELECT hostel_id, room_type_id FROM bookings WHERE id = ?', [booking_id]);
            const hostel_id = bookings[0].hostel_id;

            const [roomTypes] = await db.execute('SELECT price_per_month FROM room_types WHERE id = ?', [bookings[0].room_type_id]);
            const amount_inr = roomTypes[0].price_per_month;

            await db.execute(
                `INSERT INTO payments (student_id, hostel_id, booking_id, amount, paypal_order_id, status, paid_at, next_due_date)
                 VALUES (?, ?, ?, ?, ?, 'completed', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))`,
                [student_id, hostel_id, booking_id, amount_inr, paypal_order_id]
            );
            res.json({ message: 'Payment successful!', status: 'COMPLETED' });
        } else {
            res.status(400).json({ error: 'Payment not completed' });
        }
    } catch (error) {
        console.error('PayPal Capture Error:', error.message);
        res.status(500).json({ error: 'Failed to capture PayPal order' });
    }
};

const getMyPayments = async (req, res) => {
    try {
        const student_id = req.user.id;
        const [payments] = await db.execute(
            `SELECT p.*, h.name as hostel_name FROM payments p 
             JOIN hostels h ON p.hostel_id = h.id 
             WHERE p.student_id = ? ORDER BY p.paid_at DESC`,
            [student_id]
        );
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
};

module.exports = { 
    createBooking, 
    getMyBookings,
    createOrder,
    captureOrder,
    getMyPayments
};
