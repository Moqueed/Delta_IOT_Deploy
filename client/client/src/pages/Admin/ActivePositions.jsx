import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Button, message, Select } from "antd";
import {
  createPosition,
  deletePosition,
  updatePosition,
  fetchPositions,
} from "../../api/activePositions";
import "./PositionForm.css";
import { Link } from "react-router-dom";
import { HomeOutlined, LogoutOutlined } from "@ant-design/icons";
import DashboardHomeLink from "../../components/DashboardHomeLink";
import { useAdmin } from "../../components/AdminContext";

const { Option } = Select;

const PositionForm = () => {
  const [form] = Form.useForm();
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
   const { adminName } = useAdmin();

  // ✅ Function to fetch and refresh positions
  const refreshPositions = async () => {
    try {
      const data = await fetchPositions();
      setPositions(data);
    } catch (error) {
      console.error("Error refreshing positions:", error);
    }
  };

  // ✅ Fetch positions on initial load
  useEffect(() => {
    refreshPositions();
  }, []);

  useEffect(() => {
    if (selectedPosition) {
      const updatedPosition = {
        ...selectedPosition,
        position: selectedPosition.position || "",
        skills: Array.isArray(selectedPosition.skills)
          ? selectedPosition.skills.join(", ")
          : selectedPosition.skills || "",
        HRs: Array.isArray(selectedPosition.HRs)
          ? selectedPosition.HRs.join(", ")
          : selectedPosition.HRs || "",
        department: selectedPosition.department || "",
        vacancy: Number(selectedPosition.vacancy) || 0,
        minimum_experience: Number(selectedPosition.minimum_experience) || 0,
        maximum_experience: Number(selectedPosition.maximum_experience) || 0,
        job_description: selectedPosition.job_description || "",
      };

      form.setFieldsValue(updatedPosition);
    } else {
      form.resetFields();
    }
  }, [selectedPosition, form]);

  const handleSelectPosition = (pos) => {
    setSelectedPosition(pos);
    const updatedPosition = {
      ...pos,
      skills: Array.isArray(pos.skills)
        ? pos.skills.join(", ")
        : pos.skills || "",
      HRs: Array.isArray(pos.HRs) ? pos.HRs.join(", ") : pos.HRs || "",
    };
    form.setFieldsValue(updatedPosition);
  };

  const handleAdd = async (values) => {
    try {
      const payload = {
        ...values,
        skills: values.skills.split(",").map((s) => s.trim()),
        HRs: values.HRs.split(",").map((h) => h.trim()),
      };

      await createPosition(payload);
      message.success("Position added!");
      form.resetFields();
      refreshPositions();
    } catch (err) {
      console.error("Add error:", err);
      message.error("Failed to add position");
    }
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const updated = {
        ...values,
        skills: values.skills.split(",").map((s) => s.trim()),
        HRs: values.HRs.split(",").map((h) => h.trim()),
      };
      await updatePosition(selectedPosition.job_id, updated);
      message.success("Position updated!");
      refreshPositions();
      fetchPositions().then((data) => setPositions(data));
    } catch (err) {
      console.error("Update error:", err);
      message.error("Failed to update position");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePosition(selectedPosition.job_id);
      message.success("Position deleted!");
      form.resetFields();
      refreshPositions();
      fetchPositions().then((data) => setPositions(data));
    } catch (err) {
      console.error("Delete error:", err);
      message.error("Failed to delete position");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout successfully");
    window.location.href = "/login";
  };

  return (
    <div className="position-form-container">
      <div className="position-header">
        <div className="header-left">
          <img src="/images/hrms-logo.jpg" alt="logo" className="logo" />
          <DashboardHomeLink/>
        </div>

        <h2>Active Positions</h2>

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

      <div className="position-body">
        <div className="position-list">
          <h3 className="position-list-title">Position List</h3>
          {positions.length > 0 ? (
            positions.map((pos) => (
              <div
                key={pos.job_id}
                className={`position-list-card ${
                  selectedPosition?.job_id === pos.job_id ? "selected" : ""
                }`}
                onClick={() => handleSelectPosition(pos)}
              >
                {pos.position}
              </div>
            ))
          ) : (
            <p>No positions found.</p>
          )}
        </div>

        <div className="position-content">
          <Form
            form={form}
            layout="vertical"
            className="position-form"
            onFinish={handleAdd}
          >
            <Form.Item
              label="Position"
              name="position"
              className="form-item"
              rules={[{ required: true, message: "Position is required" }]}
            >
              <Select placeholder="Select a position">
                {[
                  "Python Developer",
                  "EMD Developer",
                  "Intern",
                  "Trainee",
                  "C++ Developer",
                  "Accounts",
                  "Developer",
                ].map((p) => (
                  <Option key={p} value={p}>
                    {p}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Skills (comma-separated)"
              name="skills"
              className="form-item"
              rules={[{ required: true, message: "Please enter skills" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Department"
              name="department"
              className="form-item"
              rules={[{ required: true, message: "Department is required" }]}
            >
              <Select placeholder="Select a department" showSearch allowClear>
                {[
                  "IT",
                  "EMDB",
                  "Accounts",
                  "Financial",
                  "Python",
                  "Engineering",
                ].map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Vacancies"
              name="vacancy"
              className="form-item"
              rules={[
                { required: true, message: "please enter number of vacancies" },
              ]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Minimum Experience (years)"
              name="minimum_experience"
              className="form-item"
              rules={[
                { required: true, message: "Minimum experience is required" },
              ]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Maximum Experience (years)"
              name="maximum_experience"
              className="form-item"
              rules={[
                { required: true, message: "Maximum experience is required" },
              ]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Job Description"
              name="job_description"
              className="form-item"
              rules={[
                { required: true, message: "Job Description is required" },
              ]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
              label="HRs (comma-separated)"
              name="HRs"
              className="form-item"
              rules={[{ required: true, message: "Please enter HRs" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item className="button-row">
              <Button type="primary" htmlType="submit" className="add-btn">
                Add
              </Button>
              <Button onClick={handleUpdate} className="update-btn">
                Update
              </Button>
              <Button danger onClick={handleDelete} className="delete-btn">
                Delete
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default PositionForm;
