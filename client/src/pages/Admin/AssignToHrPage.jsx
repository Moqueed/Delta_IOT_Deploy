import { Form, Input, Button, Upload, message, Select } from "antd";
import { LogoutOutlined, UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import {
  assignCandidateToHR,
  fetchAllNewCandidates,
  searchAssignments,
} from "../../api/assignToHr";
import "./AssignToHrPage.css";
import DashboardHomeLink from "../../components/DashboardHomeLink";
import { useAdmin } from "../../components/AdminContext";

const AssignToHrPage = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [searchForm] = Form.useForm();
  const [assignedCandidates, setAssignedCandidates] = useState([]);
  const { adminName } = useAdmin();

  useEffect(() => {
    const getCandidates = async () => {
      try {
        const data = await fetchAllNewCandidates();
        setAssignedCandidates(data);
      } catch (error) {
        console.error("Error loading assigned candidates:", error);
      }
    };
    getCandidates();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout successfully");
    window.location.href = "/login";
  };

  const handleSearch = async () => {
    const values = searchForm.getFieldsValue();
    const search_input = values.search_input?.toString().trim();

    if (!search_input) return;

    const filters = {};
    if (/\S+@\S+\.\S+/.test(search_input)) {
      filters.candidate_email = search_input;
    } else {
      filters.contact_number = search_input;
    }

    try {
      const result = await searchAssignments(filters);
      if (result && result.length > 0) {
        setSearchError("Candidate already exists. Please verify before proceeding.");
      } else {
        setSearchError(null);
        message.success("No duplicate found. You can continue.");
      }
    } catch (error) {
      console.error(error);
      setSearchError("Search failed");
      message.error("Search failed");
    }
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("HR_mail", values.hr_email);
    formData.append("HR_name", values.hr_name);
    formData.append("candidate_name", values.candidate_name);
    formData.append("candidate_email_id", values.candidate_email);
    formData.append("position", values.position);
    formData.append("contact_number", values.contact_number || "");
    formData.append("comments", values.comments || "");

    if (fileList.length > 0) {
      formData.append("attachments", fileList[0].originFileObj);
    }

    try {
      const res = await assignCandidateToHR(formData);
      message.success(res.message);
      form.resetFields();
      setFileList([]);
    } catch (err) {
      console.error(err);
      message.error(err.message || "Failed to assign candidate");
    }
  };

  return (
    <div className="assign-to-hr-page">
      <div className="assign-to-hr-container">
        <div className="assign-header">
          <div className="header-left">
            <img src="/images/hrms-logo.jpg" alt="logo" className="logo" />
            <DashboardHomeLink />
          </div>

          <div><h2>Assign To HR</h2></div>

          <div className="header-right">
            <span className="welcome-text">Welcome: {adminName}</span>
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
      </div>

      <div className="page-layout">
        {/* Sidebar */}
        <div className="sidebar-container">
          <h3>Assigned Candidates</h3>
          <div className="candidate-list">
            {assignedCandidates.length > 0 ? (
              assignedCandidates.map((candidate) => (
                <div className="candidate-card" key={candidate.id}>
                  <p className="candidate-name">{candidate.candidate_name}</p>
                  <p className="candidate-email">{candidate.candidate_email_id}</p>
                </div>
              ))
            ) : (
              <p>No assigned candidates found.</p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Search Form */}
          <Form
            form={searchForm}
            layout="inline"
            className="search-form"
            onFinish={handleSearch}
          >
            <Form.Item name="search_input" label="Candidate Email / Contact">
              <Input placeholder="Enter candidate email or contact number" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Search
              </Button>
            </Form.Item>
          </Form>

          {searchError && <div className="search-error-message">{searchError}</div>}

          {/* Assign Form */}
          <Form
            className="assign-to-hr-form"
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <div className="form-section">
              <Form.Item
                label="HR Email"
                name="hr_email"
                rules={[{ required: true, message: "Please enter HR email" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="HR Name"
                name="hr_name"
                rules={[{ required: true, message: "Please enter HR name" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Candidate Name"
                name="candidate_name"
                rules={[{ required: true, message: "Please enter candidate name" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Candidate Email"
                name="candidate_email"
                rules={[{ required: true, message: "Please enter candidate email" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Position"
                name="position"
                rules={[{ required: true, message: "Please select a position" }]}
              >
                <Select
                  placeholder="Select position"
                  options={[
                    { value: "Python Developer", label: "Python Developer" },
                    { value: "EMD Developer", label: "EMD Developer" },
                    { value: "Intern", label: "Intern" },
                    { value: "Trainee", label: "Trainee" },
                    { value: "C++ Developer", label: "C++ Developer" },
                    { value: "Accounts", label: "Accounts" },
                    { value: "Developer", label: "Developer" },
                  ]}
                />
              </Form.Item>

              <Form.Item label="Contact Number" name="contact_number">
                <Input />
              </Form.Item>

              <Form.Item label="Comments" name="comments">
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item label="Resume">
                <Upload
                  maxCount={1}
                  fileList={fileList}
                  onRemove={() => setFileList([])}
                  beforeUpload={(file) => {
                    setFileList([file]);
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />}>Select Resume</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Send
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AssignToHrPage;
