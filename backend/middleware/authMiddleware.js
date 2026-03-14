const jwt = require('jsonwebtoken');

// Middleware to protect routes that require authentication
const protect = (req, res, next) => {
    let token;
    
    // Check if token is in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];
            
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Add user object to request
            req.user = decoded;
            
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to restrict routes to admin only
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

// Middleware to restrict review posting to verified students
const verifiedStudentOnly = (req, res, next) => {
    if (req.user && req.user.role === 'student' && req.user.verification_status === 'verified') {
        next();
    } else {
        res.status(403).json({ message: 'Only verified students can perform this action' });
    }
};

module.exports = { protect, adminOnly, verifiedStudentOnly };
