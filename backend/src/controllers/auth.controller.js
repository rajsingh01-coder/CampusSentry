const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(400, 'User already exists');

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id, user.role);

    res.status(201).json(new ApiResponse(201, { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token }, 'User registered successfully'));
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user._id, user.role);
    res.status(200).json(new ApiResponse(200, { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token }, 'Login successful'));
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(new ApiResponse(200, user, 'User details retrieved'));
  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser, loginUser, getMe };
