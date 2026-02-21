const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password // hashing handled by model
    });

    res.status(201).json({
      message: 'User created successfully',
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }

    const isMatched = await user.matchPassword(password);
    if (!isMatched) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};
