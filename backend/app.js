// app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./utils/errorHandler'); // ✅ 这是中间件

// 路由
const authRoutes = require('./routes/auth.routes');
const todoRoutes = require('./routes/todos.routes');

require('dotenv').config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// 🔥 添加：调试中间件 - 打印所有进入的请求
app.use((req, res, next) => {
  console.log('🎯 请求进入:', req.method, req.path);
  console.log('🔍 Headers:', req.headers);
  console.log('📦 Body:', req.body);
  next();
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// ✅ 全局错误处理中间件 - 放在最后
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});