import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Popconfirm,
  Tag,
  Divider,
  Row,
  Col,
  Spin,
  Select,
  Upload,
} from "antd";
import {
  HomeOutlined,
  LogoutOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../api";
import {
  cancelApprovalRequest,
  reviewCandidateStatus,
  updateApprovalById,
} from "../../api/approval";
import "./ApprovalsPage.css";
import { Link } from "react-router-dom";
import DashboardHomeLink from "../../components/DashboardHomeLink";
import { uploadResumeToAll } from "../../api/upload";
import { useAdmin } from "../../components/AdminContext";
import NotificationBell from "../../components/NotificationBell";

const ApprovalsPage = () => {
  const [approvals, setApprovals] = useState([]);
  const [formStates, setFormStates] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
   const { adminName } = useAdmin();

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/approvals/fetch");
      const data = response.data;

      setApprovals(data);

      const editableStates = {};
      data.forEach((item) => {
        editableStates[item.id] = { ...item };
      });
      setFormStates(editableStates);
    } catch (error) {
      message.error("Failed to fetch approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (id, key, value) => {
    setFormStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  const handleFileChange = async (id, file) => {
    try {
      const email = formStates[id]?.candidate_email_id;
      if (!email) {
        message.error("Candidate email is required before uploading.");
        return;
      }

      const response = await uploadResumeToAll(email, file);
      const resumeUrl = response?.candidateResume;

      if (resumeUrl) {
        setFormStates((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            attachments: resumeUrl,
          },
        }));
        message.success("Resume uploaded successfully");
      } else {
        message.error("Failed to upload resume");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Error uploading resume");
    }
  };

  const handleCandidateClick = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleReview = async (email, decision) => {
    try {
      await reviewCandidateStatus(email, { approval_status: decision });
      message.success(`Candidate ${decision}`);
      fetchApprovals();
      setSelectedCandidate(null);
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout successfully");
    window.location.href = "/login";
  };

  const handleCancel = async (id) => {
    try {
      await cancelApprovalRequest(id);
      message.success("Approval cancelled");
      fetchApprovals();
      setSelectedCandidate(null);
    } catch (error) {
      message.error("Failed to cancel approval");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateApprovalById(id, formStates[id]);
      message.success("Approval updated successfully");
      fetchApprovals();
      setSelectedCandidate(null);
    } catch (error) {
      message.error("Failed to update approval");
    }
  };

  const getStatusTag = (status) => {
    const color =
      status === "Approved"
        ? "green"
        : status === "Rejected"
        ? "red"
        : "orange";
    return <Tag color={color}>{status}</Tag>;
  };

  const fields = [
    { label: "HR Name", key: "HR_name" },
    { label: "HR Mail", key: "HR_mail" },
    { label: "Entry Date", key: "entry_date" },
    { label: "Candidate Name", key: "candidate_name" },
    { label: "Candidate Email", key: "candidate_email_id" },
    { label: "Contact Number", key: "contact_number" },
    {
      label: "Position",
      key: "position",
      type: "dropdown",
      options: [
        "Python Developer",
        "EMD Developer",
        "Intern",
        "Trainee",
        "C++ Developer",
        "Accounts",
        "Developer",
      ],
    },
    {
      label: "Department",
      key: "department",
      type: "dropdown",
      options: ["IT", "EMDB", "Accounts", "Financial", "Python", "Engineering"],
    },
    {
      label: "Band",
      key: "band",
      type: "dropdown",
      options: ["L0", "L1", "L2", "L3"],
    },
    {
      label: "Progress Status",
      key: "progress_status",
      type: "dropdown",
      options: [
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
      ],
    },
    { label: "Status Date", key: "status_date" },
    {
      label: "Profile Stage",
      key: "profile_stage",
      type: "dropdown",
      options: ["Open", "closed"],
    },
    { label: "Current Company", key: "current_company" },
    { label: "Current Location", key: "current_location" },
    { label: "Permanent Location", key: "permanent_location" },
    { label: "Qualification", key: "qualification" },
    { label: "Experience (years)", key: "experience" },
    { label: "Current CTC", key: "current_ctc" },
    { label: "Expected CTC", key: "expected_ctc" },
    { label: "Notice Period", key: "notice_period" },
    { label: "Reference", key: "reference" },
    { label: "Attachments", key: "attachments", type: "upload" },
  ];

  useEffect(() => {
    fetchApprovals();
  }, []);

  const candidateToShow = selectedCandidate;
  const formData = candidateToShow ? formStates[candidateToShow.id] || {} : {};

  return (
    <div className="approvals-container">
      <div className="candidate-header">
        <div className="header-left">
          <img src="/images/hrms-logo.jpg" alt="logo" className="logo" />
          <DashboardHomeLink />
        </div>

        <h2>Approvals</h2>

        <div className="header-right">
          <NotificationBell/>
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

      <div className="candidate-body">
        <div className="candidate-sidebar">
          <h3>Approvals List</h3>
          <div className="candidate-list">
            {approvals.length > 0 ? (
              approvals.map((candidate) => (
                <div
                  className="candidate-list-card"
                  key={candidate.id}
                  onClick={() => handleCandidateClick(candidate)}
                  style={{ cursor: "pointer" }}
                >
                  <p className="candidate-name">{candidate.candidate_name}</p>
                </div>
              ))
            ) : (
              <p>No Approvals found.</p>
            )}
          </div>
        </div>

        <div className="candidate-content">
          {loading ? (
            <Spin />
          ) : !candidateToShow ? (
            <p className="no-approvals">Select a candidate to review.</p>
          ) : (
            <Form
              key={candidateToShow.id}
              layout="vertical"
              className="approval-form"
            >
              <Row gutter={16}>
                {fields.map((field) => (
                  <Col span={8} key={field.key}>
                    <Form.Item label={field.label} className="approval-field">
                      {field.type === "dropdown" ? (
                        <Select
                          value={formData[field.key]}
                          onChange={(value) =>
                            handleFieldChange(
                              candidateToShow.id,
                              field.key,
                              value
                            )
                          }
                        >
                          {field.options.map((opt) => (
                            <Select.Option key={opt} value={opt}>
                              {opt}
                            </Select.Option>
                          ))}
                        </Select>
                      ) : field.type === "upload" ? (
                        <>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const selectedFile = e.target.files[0];
                              if (selectedFile) {
                                handleFileChange(
                                  candidateToShow.id,
                                  selectedFile
                                );
                              }
                            }}
                          />
                          {formData.attachments && (
                            <div style={{ marginTop: 8 }}>
                              <a
                                href={`http://localhost:5000${formData.attachments.replace(
                                  "/uploads",
                                  "/api/uploads"
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                📄 View Resume
                              </a>
                            </div>
                          )}
                        </>
                      ) : (
                        <Input
                          value={formData[field.key]}
                          onChange={(e) =>
                            handleFieldChange(
                              candidateToShow.id,
                              field.key,
                              e.target.value
                            )
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                ))}

                <Col span={8}>
                  <Form.Item label="Approval Status">
                    {getStatusTag(formData.approval_status)}
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Skills">
                    <Input.TextArea
                      value={formData.skills}
                      onChange={(e) =>
                        handleFieldChange(
                          candidateToShow.id,
                          "skills",
                          e.target.value
                        )
                      }
                      autoSize={{ minRows: 2 }}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Comments">
                    <Input.TextArea
                      value={formData.comments}
                      onChange={(e) =>
                        handleFieldChange(
                          candidateToShow.id,
                          "comments",
                          e.target.value
                        )
                      }
                      autoSize={{ minRows: 2 }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {formData.approval_status === "Pending" && (
                <Form.Item className="approval-actions">
                  <Button
                    type="primary"
                    onClick={() =>
                      handleReview(formData.candidate_email_id, "Approved")
                    }
                    style={{ marginRight: 8 }}
                  >
                    Approve
                  </Button>
                  <Button
                    danger
                    onClick={() =>
                      handleReview(formData.candidate_email_id, "Rejected")
                    }
                    style={{ marginRight: 8 }}
                  >
                    Reject
                  </Button>
                  <Popconfirm
                    title="Cancel this approval?"
                    onConfirm={() => handleCancel(candidateToShow.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="default" style={{ marginRight: 8 }}>
                      Cancel
                    </Button>
                  </Popconfirm>
                  <Button
                    onClick={() => handleUpdate(candidateToShow.id)}
                    type="default"
                  >
                    Update
                  </Button>
                </Form.Item>
              )}
              <Divider />
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalsPage;
