const db = require('../db/connection');

// @desc    Get all users (students)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT id, email, full_name, role, verification_status, id_card_path, created_at
            FROM users 
            WHERE role = 'student'
            ORDER BY created_at DESC
        `);
        
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

// @desc    Verify a student account
// @route   POST /api/admin/verify-user
// @access  Private (Admin)
const verifyUser = async (req, res) => {
    try {
        const { userId, status } = req.body; // status should be 'verified' or 'rejected'

        if (!userId || !['verified', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid data provided' });
        }

        const [result] = await db.query(
            'UPDATE users SET verification_status = ? WHERE id = ? AND role = "student"',
            [status, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or is an admin' });
        }

        res.json({ message: `User status updated to ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating user status' });
    }
};

module.exports = {
    getUsers,
    verifyUser
};
