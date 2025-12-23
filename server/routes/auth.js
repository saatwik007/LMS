// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check for existing user
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return res.status(409).json({ message: 'Username or email already in use.' });
    }
    // Create and save user
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'Registration successful.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;
  // Find user by username or email
  const user = await User.findOne({
    $or: [
      { username: emailOrUsername },
      { email: emailOrUsername }
    ],
    password
  });
  if (user) {
    // In production, return a JWT or session token here
    res.json({ message: 'Login successful', token: 'dummy-token' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;