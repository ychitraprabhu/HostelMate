const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const hostelController = require('../controllers/hostelController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Multer storage setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Appends timestamp to filename
  }
});
const upload = multer({ storage: storage });

// Public routes
router.get('/', hostelController.getAllApprovedHostels);
router.get('/:id', hostelController.getHostelById);
router.get('/:hostel_id/rooms', hostelController.getRoomsByHostelId);

// Owner only routes
router.get('/owner/my-hostels', verifyToken, requireRole('owner'), hostelController.getMyHostels);
router.get('/owner/stats', verifyToken, requireRole('owner'), hostelController.getOwnerStats);
router.post('/', verifyToken, requireRole('owner'), upload.single('image'), hostelController.createHostel);
router.put('/:id', verifyToken, requireRole('owner'), upload.single('image'), hostelController.updateHostel);

module.exports = router;
