const db = require('../db/connection');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    // Excluding passwords for security
    const [users] = await db.query('SELECT id, name, email, role, created_at FROM users');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching users.' });
  }
};

// Get all hostels (including unapproved)
const getAllHostels = async (req, res) => {
  try {
    const [hostels] = await db.query('SELECT * FROM hostels');
    res.json(hostels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching hostels.' });
  }
};

// Approve a hostel
const approveHostel = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('UPDATE hostels SET is_approved = true WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hostel not found.' });
    }

    res.json({ message: 'Hostel approved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while approving hostel.' });
  }
};

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const [reviews] = await db.query(`
      SELECT r.*, u.name as student_name, h.name as hostel_name 
      FROM reviews r
      JOIN users u ON r.student_id = u.id
      JOIN hostels h ON r.hostel_id = h.id
      ORDER BY r.created_at DESC
    `);
    
    // Anonymize names if is_anonymous is true
    const processedReviews = reviews.map(r => {
        if (r.is_anonymous) {
             return { ...r, student_name: 'Anonymous Student' };
        }
        return r;
    });

    res.json(processedReviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching reviews.' });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM reviews WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while deleting review.' });
  }
};

module.exports = {
  getAllUsers,
  getAllHostels,
  approveHostel,
  getAllReviews,
  deleteReview
};
