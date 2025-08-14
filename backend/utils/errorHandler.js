class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// 开发环境错误处理
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// 生产环境错误处理
const sendErrorProd = (err, res) => {
  // 操作错误，发送给客户端
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  } 
  // 编程或其他未知错误，不泄露细节
  else {
    console.error('ERROR 💥', err);
    
    res.status(500).json({
      success: false,
      message: 'Something went very wrong!',
    });
  }
};

// 处理MongoDB ID错误
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ErrorResponse(message, 400);
};

// 处理MongoDB重复字段错误
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ErrorResponse(message, 400);
};

// 处理MongoDB验证错误
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ErrorResponse(message, 400);
};

// 处理JWT错误
const handleJWTError = () =>
  new ErrorResponse('Invalid token. Please log in again!', 401);

// 处理JWT过期错误
const handleJWTExpiredError = () =>
  new ErrorResponse('Your token has expired! Please log in again.', 401);

// 全局错误处理中间件
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // MongoDB错误处理
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports.ErrorResponse = ErrorResponse;