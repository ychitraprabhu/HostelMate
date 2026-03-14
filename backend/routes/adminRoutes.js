const express = require('express');
const router = express.Router();
const { getUsers, verifyUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(protect);
router.use(adminOnly);

router.get('/users', getUsers);
router.post('/verify-user', verifyUser);

module.exports = router;
