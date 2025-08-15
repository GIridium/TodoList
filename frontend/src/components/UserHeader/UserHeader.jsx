// src/components/UserHeader/UserHeader.jsx
import { Button } from "antd";

/**
 * 用户头部信息组件
 * 显示当前登录用户的用户名和登出按钮
 *
 * @param {Object} user - 当前用户对象，包含 username 字段
 * @param {Function} onLogout - 点击登出按钮时触发的回调函数
 */
export default function UserHeader({ user, onLogout }) {
  return (
    <div className="user-header">
      <span>Welcome, {user?.username}</span>
      <Button type="link" onClick={onLogout} className="logout-btn">
        Logout
      </Button>
    </div>
  );
}
