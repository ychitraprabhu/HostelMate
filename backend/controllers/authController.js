const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

// --------------------
// Register Controller
// --------------------
const register = async (req, res) => {
  try {
    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;
    const role = req.body.role;


    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!['student', 'owner'].includes(role)) {
      return res.status(400).json({ error: 'Role must be student or owner.' });
    }

    // Check existing email
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );

    // Create JWT
    const token = jwt.sign(
      { id: result.insertId, name, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: result.insertId, name, email, role }
    });


  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: 'Error during registration.' });
  }
};

// --------------------
// Login Controller
// --------------------
const login = async (req, res) => {
  try {

    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });


  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: 'Error during login.' });
  }
};

module.exports = { register, login };
