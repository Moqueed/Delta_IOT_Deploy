import React, { useEffect, useState } from "react";
import { Table, Spin, message, Button } from "antd";
import { fetchBufferData } from "../../api/totalData";
import DashboardHomeLink from "../../components/DashboardHomeLink";
import { HomeOutlined, LoginOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useHR } from "../../components/HRContext";
import NotificationBell from "../../components/NotificationBell";

const BufferDataPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hrName } = useHR();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchBufferData();
        setData(response);
      } catch (error) {
        message.error("Failed to load Buffer Data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const columns = [
    { title: "HR Name", dataIndex: "HR_name", key: "HR_name" },
    { title: "HR Email", dataIndex: "HR_mail", key: "HR_mail" },
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
    { title: "Position", dataIndex: "position", key: "position" },
    { title: "Department", dataIndex: "department", key: "department" },
    {
      title: "Progress Status",
      dataIndex: "progress_status",
      key: "progress_status",
    },
    { title: "Entry Date", dataIndex: "entry_date", key: "entry_date" },
    { title: "Status Date", dataIndex: "status_date", key: "status_date" },
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

        <h2>Buffer Data</h2>

        <div className="header-right">
          <NotificationBell/>
          <span className="welcome-text">Welcome: {hrName}</span>
          <Button
            icon={<LoginOutlined />}
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
      <div style={{ padding: 24 }}>
        {/* <h2 style={{ textAlign: "center" }}>Buffer Data</h2> */}
        {loading ? (
          <Spin
            size="large"
            style={{ display: "block", margin: "50px auto" }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="candidate_email_id"
          />
        )}
      </div>
    </div>
  );
};

export default BufferDataPage;
