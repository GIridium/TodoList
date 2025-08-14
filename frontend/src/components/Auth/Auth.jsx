import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const Auth = ({ onLogin, onRegister, loading, onRegisterSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      if (isLogin) {
        // 调用登录逻辑
        await onLogin(values);
      } else {
        // 调用注册逻辑
        const success = await onRegister(values);
        if (success) {
          form.resetFields(); // 清空表单
          setIsLogin(true); // 切换到登录界面
          onRegisterSuccess?.(); // 触发注册成功回调
        }
      }
    } catch (error) {
      console.error("认证错误:", error);
      message.error("操作失败，请重试");
    }
  };

  const switchMode = () => {
    form.resetFields();
    setIsLogin(!isLogin);
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "登录" : "注册"}</h2>
      <Form
        form={form}
        name="auth-form"
        initialValues={{ remember: true }}
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: "请输入用户名!" },
            { min: 3, message: "用户名至少3个字符" },
            { max: 20, message: "用户名最多20个字符" },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: "用户名只能包含字母、数字和下划线",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="用户名"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "请输入密码!" },
            { min: 6, message: "密码至少6个字符" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
            disabled={loading}
          />
        </Form.Item>

        {!isLogin && (
          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请确认密码!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不匹配!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
              disabled={loading}
            />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {isLogin ? "登录" : "注册"}
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="link" onClick={switchMode} block>
            {isLogin ? "没有账号？立即注册" : "已有账号？立即登录"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Auth;
