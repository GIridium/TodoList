// controllers/todos.controller.js
const Todo = require('../models/Todo');
const User = require('../models/User');

// 获取所有 Todo
exports.getTodos = async (req, res, next) => {
  try {
    // 从 req.user 获取用户 ID（由 JWT 中间件设置）
    const todos = await Todo.find({ user: req.user.id }).sort('-createdAt');
    
    // ✅ 直接返回 todos 数组
    // 或者返回 { success: true, data: todos }，前端 api.js 会处理
    res.status(200).json(todos);
    
  } catch (err) {
    console.error('Error in getTodos:', err);
    next(err); // 交给错误处理中间件
  }
};

// 创建 Todo
exports.createTodo = async (req, res, next) => {
  const { title, dueDate } = req.body;

  // ✅ 基本验证
  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Title is required'
    });
  }

  try {
    const todo = new Todo({
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      completed: false,
      user: req.user.id // 关联到当前用户
    });

    const savedTodo = await todo.save();
    
    // ✅ 关键：返回完整的 savedTodo 对象
    // 前端需要 _id, title, completed 等字段
    res.status(201).json(savedTodo);
    
  } catch (err) {
    console.error('Error in createTodo:', err);
    next(err);
  }
};

// 更新 Todo (toggle completed)
exports.updateTodo = async (req, res, next) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: id, user: req.user.id }, // 确保属于当前用户
      { completed },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.status(200).json(todo);
    
  } catch (err) {
    console.error('Error in updateTodo:', err);
    next(err);
  }
};

// 删除 Todo
exports.deleteTodo = async (req, res, next) => {
  console.log('🔥 deleteTodo 函数被调用！'); // 🔥 调试：确认函数执行
  console.log('📥 请求参数 (req.params):', req.params); // 🔍 查看传入的 ID
  console.log('👤 当前用户信息 (req.user):', req.user); // 🔍 查看用户是否正确附加

  const { id } = req.params;
  
  if (!id) {
    console.log('❌ 错误：请求参数中缺少 Todo ID');
    return res.status(400).json({
      success: false,
      message: 'Todo ID is required'
    });
  }

  try {
    // ✅ 2. 确保 req.user 存在 (由 JWT 中间件设置)
    if (!req.user || !req.user.id) {
      console.log('❌ 错误：用户未认证，req.user 或 req.user.id 不存在');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    console.log(`🗑️ 正在尝试删除 ID 为 '${id}' 且属于用户 '${req.user.id}' 的 Todo...`);

    // ✅ 3. 查找并删除 Todo，确保属于当前用户
    const todo = await Todo.findOneAndDelete({
      _id: id,
      user: req.user.id
    });

    console.log('✅ 数据库操作完成，查询结果:', todo ? '找到并删除' : '未找到匹配项');

    // ✅ 4. 检查是否找到并删除了 Todo
    if (!todo) {
      console.log('❌ 未找到 Todo 或用户无权限删除');
      return res.status(404).json({
        success: false,
        message: 'Todo not found or you do not have permission to delete it'
      });
    }

    // ✅ 5. 成功删除
    console.log('✅ Todo 删除成功！');
    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully'
    });

  } catch (err) {
    // ✅ 6. 捕获所有错误，避免 500
    console.log('💥 在 deleteTodo 中捕获到异常！'); // 🔥 明确标出异常位置
    console.error('详细错误信息:', err); // 打印完整错误堆栈
    
    // 如果是无效的 ObjectId 格式
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      console.log('❌ 错误类型：无效的 ObjectId 格式');
      return res.status(400).json({
        success: false,
        message: 'Invalid Todo ID format'
      });
    }

    // 其他错误（如数据库连接问题、权限问题等）
    next(err); // 交给全局错误处理中间件
  }
};