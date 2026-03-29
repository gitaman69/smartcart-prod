const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use((req, res, next) => {
  console.log('🟡 [AUTH ROUTER]');
  console.log('Route Hit:', req.method, req.originalUrl);
  next();
});

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Refresh Token
router.post('/refresh', authController.refresh);

// Logout
router.post('/logout', authController.logout);

// Get User Profile
router.get('/me', verifyToken, authController.getMe);

module.exports = router;