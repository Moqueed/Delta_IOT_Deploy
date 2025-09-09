import React from "react";
import { Button, Card, message, Typography } from "antd";
import {
  DatabaseOutlined,
  UserAddOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LogoutOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import "./TotalDataPage.css";
import DashboardHomeLink from "../../components/DashboardHomeLink";
import { useHR } from "../../components/HRContext";


const { Title } = Typography;

const TotalDataPage = () => {
  const { hrName } = useHR();
  const sections = [
    {
      title: "Total Master Data",
      color: "bg-lightblue",
      icon: <DatabaseOutlined className="section-icon blue" />,
    },
    {
      title: "Newly Joined",
      color: "bg-lightgreen",
      icon: <UserAddOutlined className="section-icon green" />,
    },
    {
      title: "About to Join",
      color: "bg-lightyellow",
      icon: <CalendarOutlined className="section-icon orange" />,
    },
    {
      title: "Buffer Data",
      color: "bg-lightpurple",
      icon: <ClockCircleOutlined className="section-icon purple" />,
    },
    {
      title: "Rejected Data",
      color: "bg-lightpink",
      icon: <CloseCircleOutlined className="section-icon red" />,
    },
  ];

  const navigate = useNavigate();

  const handleCardClick = (section) => {
    if (section.title === "Rejected Data") {
      navigate("/total-data/rejected-data");
    } else if (section.title === "Total Master Data") {
      navigate("/total-data/total-master-data");
    } else if (section.title === "About to Join") {
      navigate("/total-data/about-to-join");
    } else if (section.title === "Newly Joined") {
      navigate("/total-data/newly-joined");
    } else if (section.title === "Buffer Data") {
      navigate("/total-data/buffer-data");
    }
  };

    const handleLogout = () => {
    localStorage.clear();
    message.success("Logout successfully");
    window.location.href = "/login";
  };

  return (
    <div className="total-data-page">
      <div className="total-page-header">
        <div className="header-left">
          <img src="/images/hrms-logo.jpg" alt="logo" className="logo" />
          <DashboardHomeLink/>
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
      {/* <Title level={1} className="page-title">
        Total Data
      </Title> */}
      <div className="card-grid">
        {sections.map((section, index) => (
          <Card
            key={section.title}
            className={`data-card ${section.color} ${
              index === 2 ? "wide-card" : ""
            }`}
            onClick={() => handleCardClick(section)}
            onMouseEnter={(e) => {
              e.currentTarget.classList.add("hovered");
            }}
            onMouseLeave={(e) => {
              e.currentTarget.classList.remove("hovered");
            }}
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
