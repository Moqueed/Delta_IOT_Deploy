// pages/RejectedDataPage.js
import React, { useEffect, useState } from "react";
import { Table, Typography, Tag, Spin, Alert, Button } from "antd";
import axios from "axios";
import DashboardHomeLink from "../../components/DashboardHomeLink";
import { HomeOutlined, LogoutOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useHR } from "../../components/HRContext";
import NotificationBell from "../../components/NotificationBell";

const { Title } = Typography;

const RejectedDataPage = () => {
  const [rejectedData, setRejectedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { hrName } = useHR();

  useEffect(() => {
    const fetchRejectedData = async () => {
      try {
        const response = await axios.get("/api/rejected/fetch");
        setRejectedData(response.data);
      } catch (err) {
        setError("Failed to fetch rejected data.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedData();
  }, []);

  const columns = [
    {
      title: "Candidate Name",
      dataIndex: "candidate_name",
      key: "candidate_name",
    },
    {
      title: "Email",
      dataIndex: "candidate_email_id",
      key: "candidate_email_id",
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Status",
      dataIndex: "progress_status",
      key: "progress_status",
      render: (status) => <Tag color="red">{status}</Tag>,
    },
    {
      title: "Rejection Reason",
      dataIndex: "rejection_reason",
      key: "rejection_reason",
    },
    {
      title: "Date",
      dataIndex: "status_date",
      key: "status_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout successfully");
    window.location.href = "/login";
  };

  return (
    <div className="total-master-data-container">
      <div className="candidate-header">
        <div className="header-left">
          <img src="/images/hrms-logo.jpg" alt="logo" className="logo" />
          <Link to="/total-data">
            <HomeOutlined className="home-icon" style={{ fontSize: "24px" }} />
          </Link>
        </div>

        <h2>Rejected Candidates</h2>

        <div className="header-right">
          <NotificationBell/>
          {hrName && hrName !== "HR" && (
            <span className="welcome-text">Welcome: {hrName}</span>
          )}

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
      <div style={{ padding: "20px" }}>
        {/* <Title level={2}>Rejected Candidates</Title> */}

        {loading ? (
          <Spin size="large" />
        ) : error ? (
          <Alert message={error} type="error" />
        ) : (
          <Table
            dataSource={rejectedData}
            columns={columns}
            rowKey={(record) => record.id}
            bordered
          />
        )}
      </div>
    </div>
  );
};

export default RejectedDataPage;
