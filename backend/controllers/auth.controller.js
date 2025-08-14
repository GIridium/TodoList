const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorHandler');

// 用户注册
exports.register = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return next(new ErrorResponse('Username already exists', 400));
    }

    // 创建新用户
    const user = await User.create({ username, password });

    // 生成JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 用户登录
exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // 检查用户是否存在
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // 生成JWT
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 生成JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};