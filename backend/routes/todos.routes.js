// routes/todos.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todos.controller');

// 🔥 调试：打印中间件是否加载
console.log('✅ todos.routes.js 被加载');
console.log('🔐 protect middleware loaded:', !!protect);
console.log('🗑️ deleteTodo controller loaded:', !!deleteTodo);

// 使用认证保护
router.use(protect);

// 路由定义
router.route('/')
  .get(getTodos)
  .post(createTodo);

// 🔥 调试：确认 DELETE 路由是否定义
console.log('📝 定义 DELETE /:id 路由');

router.route('/:id')
  .put(updateTodo)
  .delete(deleteTodo);

// 🔥 调试：确认 deleteTodo 是函数
console.log('🗑️ deleteTodo 是函数:', typeof deleteTodo === 'function');

module.exports = router;