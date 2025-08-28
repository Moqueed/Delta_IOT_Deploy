import { Form, Input, Button, Upload, message, Select, Row, Col } from "antd";
import {
  HomeOutlined,
  LogoutOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import {
  assignCandidateToHR,
  fetchAllNewCandidates,
  searchAssignments,
} from "../../api/assignToHr";
import "./AssignToHrPage.css";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import DashboardHomeLink from "../../components/DashboardHomeLink";
import { useAdmin } from "../../components/AdminContext";
const { Option } = Select;

const AssignToHrPage = () => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
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

    if (!search_input) {
      console.log("Search input is empty or invalid");
      return;
    }

    console.log("Searching for:", search_input);

    const filters = {};
    if (/\S+@\S+\.\S+/.test(search_input)) {
      filters.candidate_email = search_input;
    } else {
      filters.contact_number = search_input;
    }

    try {
      const result = await searchAssignments(filters);
      if (result && result.length > 0) {
        setSearchError(
          "Candidate already exists. Please verify before proceeding."
        );
      } else {
        setSearchError(null);
        message.success("No duplicate found. You can continue.");
      }
    } catch (error) {
      console.error(error);
      setSearchError("search failed");
      message.error("Search failed");
    }
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("HR_mail", values.hr_email); // ✅ backend expects HR email
    formData.append("HR_name", values.hr_name); // ✅ backend expects HR name
    formData.append("candidate_name", values.candidate_name); // ✅
    formData.append("candidate_email_id", values.candidate_email); // ✅
    formData.append("position", values.position);
    formData.append("contact_number", values.contact_number || "");
    formData.append("comments", values.comments || "");

    console.log("Form values:", values);

    if (file) {
      formData.append("attachments", file); // ✅ backend expects "attachments"
    }

    try {
      const res = await assignCandidateToHR(formData);
      message.success(res.message);
      form.resetFields();
      setFile(null);
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
            <DashboardHomeLink/>
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
      <div className="sidebar-container">
        <h3>Assigned Candidates</h3>
        <div className="candidate-list">
          {assignedCandidates.length > 0 ? (
            assignedCandidates.map((candidate) => (
              <div className="candidate-card" key={candidate.id}>
                <p className="candidate-name">{candidate.candidate_name}</p>
                <p className="candidate-email">
                  {candidate.candidate_email_id}
                </p>
              </div>
            ))
          ) : (
            <p>No assigned candidates found.</p>
          )}
        </div>
      </div>

      <div className="main-content">
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

        {searchError && (
          <div className="search-error-message">{searchError}</div>
        )}

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
              className="form-item"
            >
              <Input className="input-field" />
            </Form.Item>

            <Form.Item
              label="HR Name"
              name="hr_name"
              rules={[{ required: true, message: "Please enter HR name" }]}
              className="form-item"
            >
              <Input className="input-field" />
            </Form.Item>

            <Form.Item
              label="Candidate Name"
              name="candidate_name"
              rules={[
                { required: true, message: "Please enter candidate name" },
              ]}
              className="form-item"
            >
              <Input className="input-field" />
            </Form.Item>

            <Form.Item
              label="Candidate Email"
              name="candidate_email"
              rules={[
                { required: true, message: "Please enter candidate email" },
              ]}
              className="form-item"
            >
              <Input className="input-field" />
            </Form.Item>

            <Form.Item
              label="Position"
              name="position"
              rules={[{ required: true, message: "Please select a position" }]}
              className="form-item"
            >
              <Select placeholder="Select position" className="input-field">
                {[
                  "Python Developer",
                  "EMD Developer",
                  "Intern",
                  "Trainee",
                  "C++ Developer",
                  "Accounts",
                  "Developer",
                ].map((pos) => (
                  <Option key={pos} value={pos}>
                    {pos}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Contact Number"
              name="contact_number"
              className="form-item"
            >
              <Input className="input-field" />
            </Form.Item>

            <Form.Item label="Comments" name="comments" className="form-item">
              <Input.TextArea rows={3} className="input-field" />
            </Form.Item>

            <Form.Item label="Resume" className="form-item">
              <Upload
              name = "attachments"
                beforeUpload={(file) => {
                  setFile(file);
                  return false;
                }}
                onRemove={() => setFile(null)}
                fileList={file ? [{ ...file, uid: file.uid || "1" }] : []}
              >
                <Button icon={<UploadOutlined />} className="upload-btn">
                  Select Resume
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item className="form-item">
              <Button type="primary" htmlType="submit" className="submit-btn">
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
