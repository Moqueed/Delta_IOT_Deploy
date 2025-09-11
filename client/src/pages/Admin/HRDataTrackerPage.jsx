import React, { useEffect, useState } from "react";
import {
  Table,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  message,
  Modal,
  Card,
  Space,
} from "antd";
import moment from "moment";
import {
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import "./HRDataTrackerPage.css";
import {
  fetchFilteredTrackerFromActiveList,
  getHRDataEntries,
} from "../../api/hrDataTracker";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useAdmin } from "../../components/AdminContext";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const { RangePicker } = DatePicker;

const HRDataTrackerPage = () => {
  const [trackerData, setTrackerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [hrFilter, setHrFilter] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { adminName } = useAdmin();

  const STATUS_OPTIONS = [
    "Application Received",
    "Phone Screening",
    "L1 Interview",
    "Yet to Share",
    "L2 Interview",
    "Shared with Client",
    "Final Discussion",
    "Offer Released",
    "Joined",
    "Declined Offer",
    "Rejected",
    "Withdrawn",
    "No Show",
    "Buffer",
    "Hold",
  ];

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#845EC2",
    "#FF6F91",
  ];

  useEffect(() => {
    fetchTrackerData();
  }, []);

  const fetchTrackerData = async () => {
    try {
      const data = await getHRDataEntries();
      const result = await fetchFilteredTrackerFromActiveList({});
      setTrackerData(Array.isArray(data) ? data : []);
      setFilteredData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error(error);
      message.error("Failed to load HR Data Tracker");
    }
  };

  const handleFilter = async () => {
    try {
      const filters = {
        status: statusFilter,
        hr_name: hrFilter,
        startDate: dateRange?.[0]?.format("YYYY-MM-DD"),
        endDate: dateRange?.[1]?.format("YYYY-MM-DD"),
      };
      const result = await fetchFilteredTrackerFromActiveList(filters);
      setFilteredData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error(error);
      message.error("Failed to apply filters");
    }
  };

  const handleExport = () => {
    const exportData = (filteredData || []).map((item) => ({
      "HR Name": item.HR_name,
      "Candidate Name": item.candidate_name,
      Position: item.position,
      Status: item.progress_status,
      "Status Date": item.status_date
        ? moment(item.status_date).format("DD/MM/YYYY")
        : "",
      "Entry Date": item.entry_date
        ? moment(item.entry_date).format("DD/MM/YYYY")
        : "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tracker Report");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "HR_Data_Tracker_Report.xlsx");
  };

  const clearFilters = () => {
    setStatusFilter(null);
    setHrFilter(null);
    setDateRange([]);
    setFilteredData(Array.isArray(trackerData) ? trackerData : []);
  };

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout successfully");
    window.location.href = "/login";
  };

  const showAnalysis = () => setIsModalVisible(true);
  const closeAnalysis = () => setIsModalVisible(false);

  // Prepare data for charts
  const statusCount = (filteredData || []).reduce((acc, item) => {
    acc[item.progress_status] = (acc[item.progress_status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

  const allHRNames = Array.isArray(trackerData)
    ? [...new Set(trackerData.map((item) => item?.name).filter(Boolean))]
    : [];

  const columns = [
    { title: "HR Name", dataIndex: "HR_name", key: "HR_name" },
    { title: "Candidate Name", dataIndex: "candidate_name", key: "candidate_name" },
    { title: "Position", dataIndex: "position", key: "position" },
    { title: "Status", dataIndex: "progress_status", key: "progress_status" },
    {
      title: "Status Date",
      dataIndex: "status_date",
      key: "status_date",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Entry Date",
      dataIndex: "entry_date",
      key: "entry_date",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : ""),
    },
  ];

  return (
    <div className="tracker-container">
      {/* Header */}
      <div className="tracker-header">
        <div className="header-left">
          <img src="/images/hrms-logo.jpg" alt="logo" className="logo" />
          <Link to="/admin-dashboard">
            <HomeOutlined className="home-icon" />
          </Link>
        </div>
        <h2>HR Data Tracker</h2>
        <div className="header-right">
          <span className="welcome-text">Welcome: {adminName}</span>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            type="primary"
            danger
            size="small"
            style={{ marginLeft: 15 }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="tracker-filters" style={{ marginBottom: 20 }}>
        <Space wrap size="middle">
          <Select
            placeholder="Status"
            value={statusFilter ?? undefined}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            allowClear
            options={STATUS_OPTIONS.map((status) => ({ label: status, value: status }))}
          />

          <Select
            placeholder="HR Name"
            value={hrFilter ?? undefined}
            onChange={setHrFilter}
            style={{ width: 180 }}
            allowClear
            options={allHRNames.map((name) => ({ label: name, value: name }))}
          />

          <RangePicker value={dateRange} onChange={setDateRange} format="MM/DD/YYYY" />

          <Button type="primary" onClick={handleFilter}>
            Apply Filter
          </Button>
          <Button onClick={clearFilters}>Clear Filter</Button>
          <Button type="primary" onClick={handleExport}>
            Export
          </Button>
          <Button type="primary" onClick={showAnalysis} icon={<PieChartOutlined />}>
            Analysis
          </Button>
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col>
          <Card title="Total Candidates">
            <UserOutlined /> {filteredData.length}
          </Card>
        </Col>
        {Object.entries(statusCount).map(([status, count], idx) => (
          <Col key={idx}>
            <Card title={status}>{count}</Card>
          </Col>
        ))}
      </Row>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={Array.isArray(filteredData) ? filteredData : []}
        rowKey={(record) => record.id}
        bordered
        pagination={{ pageSize: 10 }}
      />

      {/* Modal Analysis */}
      <Modal
        title="Candidate Status Analysis"
        open={isModalVisible}
        onCancel={closeAnalysis}
        footer={null}
        width={700}
      >
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Modal>
    </div>
  );
};

export default HRDataTrackerPage;
