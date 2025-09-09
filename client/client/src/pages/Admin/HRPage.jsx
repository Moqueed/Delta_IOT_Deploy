import React, { useEffect, useState } from "react";
import { Form, Input, Button, List, Avatar, Card, message } from "antd";
import { addHR, getHRS, saveUpdateHR } from "../../api/hrApi";
import "./HRPage.css";
import { HomeOutlined, LogoutOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useAdmin } from "../../components/AdminContext";

const HRListPage = () => {
  const [form] = Form.useForm();
  const [hrList, setHrList] = useState([]);
  const [selectedHR, setSelectedHR] = useState(null);
  const { adminName } = useAdmin();

  const loadHRs = async () => {
    try {
      const res = await getHRS();

      console.log("Fetched HRs:", res);

      console.log("Type of res", typeof res);
      console.log("Is array?", Array.isArray(res));
      setHrList(res);
    } catch (err) {
      message.error("Failed to fetch HRs");
      console.error(err);
    }
  };

  useEffect(() => {
    loadHRs();
  }, []);

  const handleSelect = (hr) => {
    setSelectedHR(hr);
    form.setFieldsValue(hr);
  };

  const handleAddNew = async () => {
    try {
      const values = await form.validateFields();
      await addHR(values);
      message.success("HR added successfully");
      form.resetFields();
      setSelectedHR(null);
      loadHRs();
    } catch {
      message.error("Failed to add HR");
    }
  };

    const handleLogout = () => {
      localStorage.clear();
      message.success("Logout successfully");
      window.location.href = "/login";
    }

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (selectedHR) {
        await saveUpdateHR(selectedHR.id, values);
        message.success("HR updated successfully");
        form.resetFields();
        setSelectedHR(null);
        loadHRs();
      } else {
        message.warning("No HR selected for update.");
      }
    } catch {
      message.error("Failed to save HR");
    }
  };

  const handleDelete = async () => {
    if (!selectedHR) {
      message.warning("Select an HR to delete");
      return;
    }
    try {
      await deleteHR(selectedHR.id); // Assuming deleteHR API exists
      message.success("HR deleted successfully");
      form.resetFields();
      setSelectedHR(null);
      loadHRs();
    } catch {
      message.error("Failed to delete HR");
    }
  };

  return (
    <div>
      <div className="hr-header">
        <div className="header-left">
          <img src="/images/hrms-logo.jpg" alt="logo" className="logo" />
          <Link to="/admin-dashboard">
            <HomeOutlined className="home-icon" />
          </Link>
        </div>

            <h2>HR's List</h2>

        <div className="header-right">
           <span className="welcome-text">Welcome: {adminName}</span>
          <Button
            icon={<LogoutOutlined/>}
            onClick={handleLogout}
            type="primary"
            danger
            size="small"
            style={{ marginLeft: "15px"}}
        >
            Logout
        </Button>
        </div>
      </div>

      <div className="main-container">
        <div className="hr-sidebar">
          <List
            itemLayout="horizontal"
            dataSource={hrList}
            locale={{ emptyText: "No HRs Available" }}
            renderItem={(item) => (
              <List.Item
                className="hr-list-item"
                onClick={() => handleSelect(item)}
              >
                <List.Item.Meta
                  avatar={<Avatar>{item.name?.[0]?.toUpperCase()}</Avatar>}
                  title={<strong>{item.name}</strong>}
                  description={item.email}
                />
              </List.Item>
            )}
          />
          <Button
            type="primary"
            danger
            block
            className="delete-button"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>

        <div className="form-section">
          {/* <h2 className="form-title">HR'S List</h2> */}
          <Card className="container-card">
            <Form form={form} className="hr-form" layout="vertical">
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter an email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="contact_number"
                label="Contact Number"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Form>
          </Card>
        </div>

        <div className="button-panel">
          <Button type="primary" danger onClick={handleAddNew}>
            Add
          </Button>
          <Button
            type="default"
            disabled={!selectedHR}
            onClick={() => form.setFieldsValue(selectedHR)}
          >
            Edit
          </Button>
          <Button type="primary" onClick={handleSave}>
            update
          </Button>
          <Button onClick={() => form.resetFields()}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default HRListPage;
