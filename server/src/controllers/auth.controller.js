const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerUser(req, res) {
  const { username, email, password } = req.body;

    try {
      // Check for existing user
      const isUserAlreadyExist = await userModel.findOne({ $or: [{ username }, { email }] });
      if (isUserAlreadyExist) {
        return res.status(409).json({ message: 'Username or email already in use.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await userModel.create({
        username,
        email,
        password: hashedPassword
      });

      const token = jwt.sign({
        id:user._id,
      }, process.env.JWT_SECRET);

      res.cookie("token", token);

      res.status(201).json({ 
        message: 'Registration successful.',
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
}

async function loginUser(req, res) {
      const { emailOrUsername, password } = req.body;
  // Find user by username or email
  const user = await userModel.findOne({
    $or: [
      { username: emailOrUsername },
      { email: emailOrUsername }
    ]
  });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (user && await bcrypt.compare(password, user.password)) {
    // In production, return a JWT or session token here
    const token = jwt.sign({
      id: user._id,
    }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.status(201).json({ 
        message: 'Registration successful.',
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
}

async function logoutUser(req, res) {
  res.clearCookie("token");
  res.status(200).json({ message: 'Logout successful' });
}



module.exports = {
    registerUser,
    loginUser,
    logoutUser
};