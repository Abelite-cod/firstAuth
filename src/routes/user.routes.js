const express = require('express');
const {
  signup,
  login,
  makeAdmin,
  resetPassword,
  verifyOtp
} = require('../controller/user.controller');

const router = express.Router();

// Authentication
router.post('/signup', signup);
router.post('/login', login);

// Admin privilege
router.patch('/makeAdmin/:userId', makeAdmin);


// Password reset
router.post('/reset-password', resetPassword);

// OTP verification
router.post('/verify-otp', verifyOtp);

module.exports = router;

