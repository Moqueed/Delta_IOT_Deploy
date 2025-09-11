import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Button, App } from "antd";
import {
  CheckCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  SearchOutlined,
  UserSwitchOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "./AdminDashboard.css";
import { useAdmin } from "../../components/AdminContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminName } = useAdmin();
  const { message } = App.useApp(); // ✅ AntD v5

  const routeMap = {
    "active-positions": "/admin-dashboard/active-positions",
    "approvals": "/admin-dashboard/approvals",
    "hr-list": "/admin-dashboard/hr-list",
    "assign-to-hr": "/admin-dashboard/assign-to-hr",
    "hr-data-tracker": "/admin-dashboard/hr-data-tracker",
  };

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout successfully");
    navigate("/login", { replace: true });
  };

  const adminSections = [
    { key: "approvals", icon: <CheckCircleOutlined />, title: "Approvals", borderColor: "#FF6347" },
    { key: "active-positions", icon: <FileTextOutlined />, title: "Active Positions", borderColor: "#FFD700" },
    { key: "hr-list", icon: <TeamOutlined />, title: "HR's List", borderColor: "#32CD32" },
    { key: "hr-data-tracker", icon: <SearchOutlined />, title: "HR Tracker", borderColor: "#1E90FF" },
    { key: "assign-to-hr", icon: <UserSwitchOutlined />, title: "Assign to HR", borderColor: "#FF4500" },
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <img src="/images/hrms-logo.jpg" alt="logo" className="logo" />
        </div>
        <h2 className="header-title">Admin Dashboard</h2>
        <div className="header-right">
          <span className="welcome-text">Welcome: {adminName}</span>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            type="primary"
            danger
            size="small"
            className="logout-button"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="dashboard-body">
        <Row gutter={[32, 32]} className="dashboard-row">
          {adminSections.map((section) => (
            <Col
              key={section.key}
              xs={24}
              sm={12}
              md={6}
              lg={6}
              xl={6}
              className="card-col"
            >
              <Card
                hoverable
                className="hr-dashboard-card"
                style={{ border: `8px solid ${section.borderColor}` }}
                onClick={() =>
                  navigate(routeMap[section.key] || "/unauthorized")
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0, 0, 0, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 10px rgba(0, 0, 0, 0.3)";
                }}
              >
                <div className="card-icon">{section.icon}</div>
                <h3 className="card-title">{section.title}</h3>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default AdminDashboard;
