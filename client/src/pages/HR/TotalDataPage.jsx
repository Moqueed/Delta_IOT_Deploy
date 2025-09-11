// pages/TotalDataPage.js
import React from "react";
import { Card, Button, App } from "antd";
import {
  DatabaseOutlined,
  UserAddOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import DashboardHomeLink from "../../components/DashboardHomeLink";
import { useHR } from "../../components/HRContext";
import "./TotalDataPage.css";

const TotalDataPage = () => {
  const { hrName } = useHR();
  const navigate = useNavigate();

  // ✅ AntD v5 message hook
  const { message } = App.useApp();

  const sections = [
    {
      title: "Total Master Data",
      color: "bg-lightblue",
      icon: <DatabaseOutlined className="section-icon blue" />,
      route: "/total-data/total-master-data",
    },
    {
      title: "Newly Joined",
      color: "bg-lightgreen",
      icon: <UserAddOutlined className="section-icon green" />,
      route: "/total-data/newly-joined",
    },
    {
      title: "About to Join",
      color: "bg-lightyellow",
      icon: <CalendarOutlined className="section-icon orange" />,
      route: "/total-data/about-to-join",
    },
    {
      title: "Buffer Data",
      color: "bg-lightpurple",
      icon: <ClockCircleOutlined className="section-icon purple" />,
      route: "/total-data/buffer-data",
    },
    {
      title: "Rejected Data",
      color: "bg-lightpink",
      icon: <CloseCircleOutlined className="section-icon red" />,
      route: "/total-data/rejected-data",
    },
  ];

  const handleCardClick = (route) => {
    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout successfully");
    window.location.href = "/login";
  };

  return (
    <div className="total-data-page">
      {/* Header */}
      <div className="total-page-header">
        <div className="header-left">
          <img src="/images/hrms-logo.jpg" alt="logo" className="logo" />
          <DashboardHomeLink />
        </div>

        <h2>Total Data</h2>

        <div className="header-right">
          <span className="welcome-text">Welcome: {hrName}</span>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            type="primary"
            danger
            size="small"
            style={{ marginLeft: "15px" }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="card-grid">
        {sections.map((section, index) => (
          <Card
            key={section.title}
            className={`data-card ${section.color} ${
              index === 2 ? "wide-card" : ""
            }`}
            onClick={() => handleCardClick(section.route)}
            hoverable
          >
            {section.icon}
            <div className="card-title">{section.title}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TotalDataPage;
