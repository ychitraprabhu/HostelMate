const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST /api/reviews (student only)
router.post('/', verifyToken, requireRole('student'), reviewController.createReview);

// GET /api/reviews/:hostel_id
router.get('/:hostel_id', reviewController.getReviewsByHostel);

module.exports = router;
