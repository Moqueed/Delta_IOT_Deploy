import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input, Form, Select, message, Typography, Card } from "antd";
import { RegisterUser } from "../../api/users";
import "./RegisterPage.css"; // Import the CSS


const { Option } = Select;
const { Title, Text } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await RegisterUser(values);
      if (response) {
        message.success(`${values.role} registration successful! Redirecting to login...`);
        navigate("/login");
      }
    } catch (err) {
      message.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-page">
      {/* Left Form Section */}
      <div className="register-left">
        <Card className="register-card">
          <Title level={2} className="register-title">Register</Title>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="name"
              label={<Text strong>Name</Text>}
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input placeholder="Enter your name" />
            </Form.Item>

            <Form.Item
              name="email"
              label={<Text strong>Email</Text>}
              rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>

            <Form.Item
              name="password"
              label={<Text strong>Password</Text>}
              rules={[{ required: true, message: "Enter your password" }]}
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>

            <Form.Item
              name="role"
              label={<Text strong>Role</Text>}
              rules={[{ required: true, message: "Select a role" }]}
            >
              <Select placeholder="Select Role">
                <Option value="HR">HR</Option>
                <Option value="Admin">Admin</Option>
              </Select>
            </Form.Item>

            <Button type="primary" htmlType="submit" block>
              Register
            </Button>
          </Form>

          <Text className="login-link">
            Already a user? <Link to="/login">Go to Login</Link>
          </Text>
        </Card>
      </div>

      {/* Right Image Section */}
      <div className="register-right">
        <img src="/images/register-wallpaper.jpg" alt="HR Illustration" className="register-image" />
      </div>
    </div>
  );
};

export default RegisterPage;
