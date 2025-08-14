// middleware/error.js
const ErrorResponse = require('../utils/errorHandler');

// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  // 打印错误堆栈（仅在开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.error('Global Error Handler:', err.stack);
  }

  // 如果是自定义错误
  if (err instanceof ErrorResponse) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // 处理 Mongoose 错误
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({
      success: false,
      message
    });
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({
      success: false,
      message
    });
  }

  // 默认处理
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Server Error'
  });
};

module.exports = errorHandler;