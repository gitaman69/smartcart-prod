const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token missing.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

const isAdmin = (req, res, next) => {
    console.log('Checking admin role for user:', req.user);
    console.log('User role:', req.user ? req.user.role : 'No user found');
    console.log('Is admin:', req.user && req.user.role === 'admin');
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Admin access required.' });
};

module.exports = { verifyToken, isAdmin };