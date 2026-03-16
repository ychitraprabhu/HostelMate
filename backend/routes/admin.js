const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Apply admin middleware to all routes in this file
router.use(verifyToken);
router.use(requireRole('admin'));

// GET /api/admin/users
router.get('/users', adminController.getAllUsers);

// GET /api/admin/hostels
router.get('/hostels', adminController.getAllHostels);

// PUT /api/admin/hostels/:id/approve
router.put('/hostels/:id/approve', adminController.approveHostel);

// GET /api/admin/reviews
router.get('/reviews', adminController.getAllReviews);

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', adminController.deleteReview);

module.exports = router;
