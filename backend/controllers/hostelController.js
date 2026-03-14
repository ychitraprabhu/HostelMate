const db = require('../db/connection');

// get all hostels with optional filtering
const getHostels = async (req, res) => {
    try {
        const { search, maxPrice, minRating } = req.query;

        let query = `
            SELECT h.*, c.name as college_name,
            COALESCE(AVG(r.rating), 0) as avg_rating,
            COUNT(r.id) as review_count
            FROM hostels h
            JOIN colleges c ON h.college_id = c.id
            LEFT JOIN reviews r ON h.id = r.hostel_id
            WHERE 1=1
        `;
        const queryParams = [];

        if (search) {
            query += ` AND h.name LIKE ?`;
            queryParams.push(`%${search}%`);
        }
        if (maxPrice) {
            query += ` AND h.price_per_month <= ?`;
            queryParams.push(Number(maxPrice));
        }

        query += ` GROUP BY h.id`;

        if (minRating) {
            query += ` HAVING avg_rating >= ?`;
            queryParams.push(Number(minRating));
        }

        query += ` ORDER BY avg_rating DESC`;

        const [hostels] = await db.query(query, queryParams);
        res.json(hostels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving hostels' });
    }
};

// get single hostel details
const getHostel = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [hostels] = await db.query(`
            SELECT h.*, c.name as college_name,
            COALESCE(AVG(r.rating), 0) as avg_rating,
            COUNT(r.id) as review_count
            FROM hostels h
            JOIN colleges c ON h.college_id = c.id
            LEFT JOIN reviews r ON h.id = r.hostel_id
            WHERE h.id = ?
            GROUP BY h.id
        `, [id]);

        if (hostels.length === 0) {
            return res.status(404).json({ message: 'Hostel not found' });
        }

        res.json(hostels[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving hostel details' });
    }
};

// get reviews
const getHostelReviews = async (req, res) => {
    try {
        const { id } = req.params;

        const [reviews] = await db.query(`
            SELECT r.*, u.verification_status, u.id as user_id,
            CASE WHEN r.is_anonymous = 1 THEN 'Anonymous Student' ELSE u.full_name END as reviewer_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.hostel_id = ?
            ORDER BY r.created_at DESC
        `, [id]);

        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving reviews' });
    }
};

// add review
const addReview = async (req, res) => {
    try {
        const { rating, comment, is_anonymous } = req.body;
        const hostelId = req.params.id;
        const userId = req.user.id;

        const [existingReviews] = await db.query(
            'SELECT id FROM reviews WHERE user_id = ? AND hostel_id = ?',
            [userId, hostelId]
        );

        if (existingReviews.length > 0) {
            return res.status(400).json({ message: 'You have already reviewed this hostel' });
        }

        await db.query(
            'INSERT INTO reviews (user_id, hostel_id, rating, comment, is_anonymous) VALUES (?, ?, ?, ?, ?)',
            [userId, hostelId, rating, comment, is_anonymous ? 1 : 0]
        );

        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding review' });
    }
};

// Update Review
const updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const reviewId = req.params.id;
        const userId = req.user.id;

        const [result] = await db.query(
            'UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND user_id = ?',
            [rating, comment, reviewId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'Access denied or review not found' });
        }

        res.json({ message: 'Review updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating review' });
    }
};

// Delete Review
const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;

        const [result] = await db.query(
            'DELETE FROM reviews WHERE id = ? AND user_id = ?',
            [reviewId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'Access denied or review not found' });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting review' });
    }
};

// get colleges
const getColleges = async (req, res) => {
    try {
        const [colleges] = await db.query('SELECT id, name FROM colleges ORDER BY name ASC');
        res.json(colleges);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving colleges' });
    }
};

module.exports = {
    getHostels,
    getHostel,
    getHostelReviews,
    addReview,
    updateReview,
    deleteReview,
    getColleges
};
