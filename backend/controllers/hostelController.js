const db = require('../db/connection');

// Get all approved hostels (open to all)
const getAllApprovedHostels = async (req, res) => {
  try {
    const { location, type, price, sharing } = req.query;
    let query = `
      SELECT h.*, MIN(rt.price_per_month) as starting_price 
      FROM hostels h 
      LEFT JOIN room_types rt ON h.id = rt.hostel_id 
      WHERE h.is_approved = true
    `;
    let queryParams = [];

    if (location) {
      query += ' AND h.location = ?';
      queryParams.push(location);
    }
    if (type) {
      query += ' AND h.type = ?';
      queryParams.push(type);
    }
    if (sharing) {
      query += ' AND rt.sharing = ?';
      queryParams.push(sharing);
    }

    query += ' GROUP BY h.id';

    // Having clause for price filter (on the calculated starting_price)
    if (price) {
      const [min, max] = price.split('-');
      query += ` HAVING starting_price >= ${min} AND starting_price <= ${max}`;
    }

    const [hostels] = await db.query(query, queryParams);
    res.json(hostels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching hostels.' });
  }
};

// Get single hostel details with room types + review count
const getHostelById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch hostel details with owner name
    const [hostels] = await db.query(`
        SELECT h.*, u.name as owner_name 
        FROM hostels h 
        JOIN users u ON h.owner_id = u.id 
        WHERE h.id = ?
    `, [id]);
    if (hostels.length === 0) {
      return res.status(404).json({ error: 'Hostel not found.' });
    }
    const hostel = hostels[0];

    // Fetch room types
    const [roomTypes] = await db.query('SELECT * FROM room_types WHERE hostel_id = ?', [id]);
    
    // Fetch reviews with user names
    const [reviews] = await db.query(`
        SELECT r.*, u.name as user_name 
        FROM reviews r 
        JOIN users u ON r.student_id = u.id 
        WHERE r.hostel_id = ? 
        ORDER BY r.created_at DESC
    `, [id]);

    res.json({
        hostel,
        roomTypes,
        reviews,
        reviewCount: reviews.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching hostel details.' });
  }
};

// Create a new hostel listing (owner only)
const createHostel = async (req, res) => {
  try {
    const { name, location, description, type, amenities, total_rooms, available_rooms } = req.body;
    const owner_id = req.user.id; // from JWT middleware
    
    // Handle image upload from multer
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    // amenities usually comes as stringified JSON if using FormData, parse it or store directly
    
    const [result] = await db.query(
      `INSERT INTO hostels (owner_id, name, location, description, type, amenities, total_rooms, available_rooms, image_url, is_approved) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, false)`,
      [owner_id, name, location, description, type, amenities, total_rooms, available_rooms, image_url]
    );

    res.status(201).json({ 
        message: 'Hostel created successfully and is pending admin approval.',
        hostelId: result.insertId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while creating hostel.' });
  }
};

// Update an existing hostel (owner only)
const updateHostel = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user.id;
    const { name, location, description, type, amenities, total_rooms, available_rooms } = req.body;

    // Verify ownership
    const [hostels] = await db.query('SELECT owner_id FROM hostels WHERE id = ?', [id]);
    if (hostels.length === 0) {
      return res.status(404).json({ error: 'Hostel not found.' });
    }
    if (hostels[0].owner_id !== owner_id) {
       return res.status(403).json({ error: 'You are not the owner of this hostel.' });
    }

    // Partial update logic - checking if an image was re-uploaded
    let updateQuery = `UPDATE hostels SET name=?, location=?, description=?, type=?, amenities=?, total_rooms=?, available_rooms=?`;
    let queryParams = [name, location, description, type, amenities, total_rooms, available_rooms];

    if (req.file) {
      updateQuery += `, image_url=?`;
      queryParams.push(`/uploads/${req.file.filename}`);
    }

    updateQuery += ` WHERE id=?`;
    queryParams.push(id);

    await db.query(updateQuery, queryParams);

    res.json({ message: 'Hostel updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while updating hostel.' });
  }
};

// Get hostels for logged-in owner
const getMyHostels = async (req, res) => {
  try {
    const owner_id = req.user.id;
    const [hostels] = await db.query('SELECT * FROM hostels WHERE owner_id = ?', [owner_id]);
    
    res.json({ hostels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching your hostels.' });
  }
};

// Get all room types for a specific hostel
const getRoomsByHostelId = async (req, res) => {
  try {
    const { hostel_id } = req.params;
    const [rooms] = await db.query('SELECT * FROM room_types WHERE hostel_id = ?', [hostel_id]);
    res.json({ rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching room types.' });
  }
};

module.exports = {
  getAllApprovedHostels,
  getHostelById,
  createHostel,
  updateHostel,
  getMyHostels,
  getRoomsByHostelId
};
