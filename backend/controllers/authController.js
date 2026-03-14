const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

const generateToken = (id, role, status) => {
    return jwt.sign(
        { id, role, verification_status: status },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// Register user
const register = async (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({ message: 'Please include all fields' });
        }

        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let id_card_path = null;
        if (req.file) {
            id_card_path = '/uploads/' + req.file.filename;
        }

        const [result] = await db.query(
            'INSERT INTO users (email, password_hash, full_name, role, verification_status, id_card_path) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, full_name, 'student', 'pending', id_card_path]
        );

        if (result.insertId) {
            res.status(201).json({
                _id: result.insertId,
                full_name,
                email,
                role: 'student',
                verification_status: 'pending',
                token: generateToken(result.insertId, 'student', 'pending')
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            res.json({
                _id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                verification_status: user.verification_status,
                token: generateToken(user.id, user.role, user.verification_status)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    login
};
