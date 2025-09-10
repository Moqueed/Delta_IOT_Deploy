import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Input, Select, Typography, Avatar, Modal } from "antd";
import { LoginUser } from "../../api/users";
import { jwtDecode } from "jwt-decode";
import { UserOutlined } from "@ant-design/icons";
import "./LoginPage.css";

const { Title, Text } = Typography;
const { Option } = Select;

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);

    try {
      const response = await LoginUser(values);

      if (response.token) {
        const decoded = jwtDecode(response.token);

        // Store essential user info
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", decoded.role || values.role);
        localStorage.setItem("userEmail", decoded.email || values.email);
        if (decoded.role === "admin") {
          localStorage.setItem("adminName", "Rizwana Begum");
        }

        // Show success modal
        Modal.success({
          title: "Login Successful 🎉",
          content: `Welcome, ${decoded.role || values.role}!`,
          onOk: () => {
            const role = (decoded.role || values.role).toLowerCase();
            if (role === "admin") {
              navigate("/admin-dashboard", { replace: true });
            } else if (role === "hr") {
              navigate("/hr-dashboard", { replace: true });
            } else {
              Modal.error({
                title: "Invalid Role",
                content: "You do not have access to this system.",
              });
            }
          },
        });
      }
    } catch (err) {
      console.error("❌ Login failed:", err);
      Modal.error({
        title: "Login Failed ❌",
        content: "Invalid email or password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-box">
          <Avatar
            size={64}
            icon={<UserOutlined />}
            style={{ marginBottom: 10 }}
          />
          <Title level={3}>HRMS</Title>
          <Title level={4}>Log In</Title>

          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please enter your email" }]}
            >
              <Input placeholder="Enter your email" prefix="✉️" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password placeholder="Enter your password" prefix="🔒" />
            </Form.Item>

            <Form.Item
              name="role"
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Select placeholder="Select Role">
                <Option value="HR">HR</Option>
                <Option value="Admin">Admin</Option>
              </Select>
            </Form.Item>

            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign In
            </Button>
          </Form>

          <Text className="register-link">
            New user? <Link to="/register">Register here</Link>
          </Text>
        </div>
      </div>

      <div className="login-right">
        <img src="/images/hrms.png" alt="HRMS Illustration" />
      </div>
    </div>
  );
};

export default LoginPage;
