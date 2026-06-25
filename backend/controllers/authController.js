// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

// Sign token — algorithm explicitly pinned to HS256
const signToken = (user) => jwt.sign(
  {
    id: user._id,
    email: user.email,
    role: user.role,
    departmentId: user.department?._id || user.department || null,
    departmentSlug: user.departmentSlug || null,
    isOwner: user.isOwner || false,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: process.env.JWT_EXPIRE || '8h',
    algorithm: 'HS256', // explicit — prevents alg:none attack
  },
);

// Validate email format
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.verifyToken = async (req, res, next) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({ message: 'Token and user ID required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if token matches and hasn't expired
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const isTokenValid = hashedToken === user.passwordResetToken;
    const isTokenExpired = user.tokenExpiry && user.tokenExpiry < new Date();

    if (!isTokenValid || isTokenExpired) {
      return res.status(400).json({
        message: 'Invalid or expired token',
        valid: false,
      });
    }

    res.json({
      valid: true,
      message: 'Token is valid',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.setPassword = async (req, res, next) => {
  try {
    const { token, userId, password } = req.body;

    if (!token || !userId || !password) {
      return res.status(400).json({ message: 'Token, user ID, and password required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if token matches and hasn't expired
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const isTokenValid = hashedToken === user.passwordResetToken;
    const isTokenExpired = user.tokenExpiry && user.tokenExpiry < new Date();

    if (!isTokenValid || isTokenExpired) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.tokenExpiry = undefined;
    user.isActive = true; // Activate the user account
    user.isEmailVerified = true; // Mark as verified

    await user.save();

    res.json({
      message: 'Password set successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const {
      name, email, password, role, department, departmentSlug, isOwner,
    } = req.body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email address required' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Prevent SUPER_ADMIN creation via API
    if (role === 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      department,
      departmentSlug,
      isOwner,
    });

    res.status(201).json({
      token: signToken(user),
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role, departmentSlug: user.departmentSlug,
      },
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('department', 'name slug');

    // Always run matchPassword even if user not found — prevents timing attack
    // that reveals whether an email exists based on response time
    const dummyHash = '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345';
    const passwordMatch = user
      ? await user.matchPassword(password)
      : await require('bcryptjs').compare(password, dummyHash); // constant-time dummy

    if (!user || !passwordMatch) {
      // Generic message — don't reveal whether email exists
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated — contact your administrator' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      token: signToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        departmentSlug: user.departmentSlug,
        isOwner: user.isOwner,
      },
    });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    // Re-fetch from DB — never trust stale JWT payload for sensitive data
    const user = await User.findById(req.user._id)
      .populate('department', 'name slug logoUrl')
      .select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};
