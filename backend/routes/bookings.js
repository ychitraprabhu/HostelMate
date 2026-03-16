const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Booking routes (student only)
router.post('/', verifyToken, requireRole('student'), bookingController.createBooking);
router.get('/my', verifyToken, requireRole('student'), bookingController.getMyBookings);

// Payment routes (student only)
router.post('/payments/create-order', verifyToken, requireRole('student'), bookingController.createOrder);
router.post('/payments/capture-order', verifyToken, requireRole('student'), bookingController.captureOrder);
router.get('/payments/my', verifyToken, requireRole('student'), bookingController.getMyPayments);

module.exports = router;
