// middlewares/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// 保护路由中间件
const protect = asyncHandler(async (req, res, next) => {
  console.log('🔐 protect 中间件开始执行'); // 🔥 新增日志
  let token;

  // 1. 检查 Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. 提取 token
      token = req.headers.authorization.split(' ')[1];
      console.log('📎 提取到 Token:', token ? '存在' : '为空'); // 🔍

      // 3. 验证 token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token 验证成功，解码信息:', decoded); // ✅

      // 4. 获取用户信息，但不返回密码
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.log('❌ 错误：数据库中未找到用户 ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('👤 用户信息已附加到 req.user:', req.user.id); // ✅

      next(); // 继续到下一个中间件/控制器

    } catch (error) {
      console.log('💥 protect 中间件捕获到错误:', error.message); // 🔥 关键日志

      if (error.name === 'JsonWebTokenError') {
        console.log('❌ Token 无效');
        return res.status(401).json({
          success: false,
          message: 'Token is not valid'
        });
      }

      if (error.name === 'TokenExpiredError') {
        console.log('❌ Token 已过期');
        return res.status(401).json({
          success: false,
          message: 'Token has expired'
        });
      }

      // 其他错误
      console.error('未知错误:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  // 5. 如果没有 token
  if (!token) {
    console.log('❌ 错误：请求头中缺少 Bearer Token');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
});

module.exports = { protect };