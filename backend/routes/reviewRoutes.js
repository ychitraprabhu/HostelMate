const express = require('express');
const router = express.Router();
const { updateReview, deleteReview } = require('../controllers/hostelController');
const { protect } = require('../middleware/authMiddleware');

// @route   PUT /api/reviews/:id
// @route   DELETE /api/reviews/:id
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
