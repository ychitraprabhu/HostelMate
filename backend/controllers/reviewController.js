const db = require('../db/connection');

// POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const student_id = req.user.id;
    const { hostel_id, rating, comment, is_anonymous } = req.body;

    if (!hostel_id || !rating) {
      return res.status(400).json({ error: 'hostel_id and rating are required' });
    }

    // Check if student has a confirmed booking with a completed payment for this hostel
    const [bookings] = await db.execute(
      `SELECT b.id FROM bookings b
       JOIN payments p ON b.id = p.booking_id
       WHERE b.student_id = ? AND b.hostel_id = ? 
       AND b.status = 'confirmed' AND p.status = 'completed'
       LIMIT 1`,
      [student_id, hostel_id]
    );
    
    if (bookings.length === 0) {
      return res.status(403).json({ error: 'You can only review hostels where you have a confirmed and paid booking.' });
    }

    // Insert the review
    const anon = is_anonymous ? true : false;
    await db.execute(
      'INSERT INTO reviews (student_id, hostel_id, rating, comment, is_anonymous, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [student_id, hostel_id, rating, comment || '', anon, true]
    );

    // Recalculate and update avg_rating in hostels table
    const [avgResult] = await db.execute(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE hostel_id = ?',
      [hostel_id]
    );
    
    // avgResult[0].avg_rating can be null if no reviews, though we just inserted one
    const newAvg = avgResult[0].avg_rating || 0;

    await db.execute(
      'UPDATE hostels SET avg_rating = ? WHERE id = ?',
      [newAvg, hostel_id]
    );

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Error in createReview:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/reviews/:hostel_id
exports.getReviewsByHostel = async (req, res) => {
  try {
    const { hostel_id } = req.params;

    // fetch reviews with student names
    const [reviews] = await db.execute(
      `SELECT r.id, r.rating, r.comment, r.is_anonymous, r.is_verified, r.created_at, u.name as student_name
       FROM reviews r
       JOIN users u ON r.student_id = u.id
       WHERE r.hostel_id = ?
       ORDER BY r.created_at DESC`,
      [hostel_id]
    );

    // process reviews to hide names if anonymous
    const processedReviews = reviews.map(review => ({
      ...review,
      student_name: review.is_anonymous ? 'Anonymous Student' : review.student_name
    }));

    res.json(processedReviews);
  } catch (error) {
    console.error('Error in getReviewsByHostel:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
