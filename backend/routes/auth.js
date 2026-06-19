// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect, superAdminGuard } = require('../middleware/auth');

// Login — public (rate-limited in server.js)
router.post('/login', login);

// Register — requires Super Admin auth
// This prevents open user registration. The first Super Admin is created via seed.js
router.post('/register', protect, superAdminGuard, register);

// Get current user
router.get('/me', protect, getMe);

module.exports = router;
