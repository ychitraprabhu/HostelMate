const express = require('express');
const router = express.Router();
const { getHostels, getHostel, getHostelReviews, addReview, getColleges } = require('../controllers/hostelController');
const { protect, verifiedStudentOnly } = require('../middleware/authMiddleware');

router.get('/colleges', getColleges);
router.get('/', getHostels);
router.get('/:id', getHostel);
router.get('/:id/reviews', getHostelReviews);
router.post('/:id/review', protect, verifiedStudentOnly, addReview);

module.exports = router;
