import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  message,
  Spin,
  InputNumber,
  Row,
  Col,
} from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  addCandidate,
  deleteCandidate,
  getCandidatesByHR,
  searchCandidateByEmail,
  updateCandidate,
} from "../../api/candidates";
import { addToActiveList, updateActiveList } from "../../api/activeList";
import { uploadResumeToAll } from "../../api/upload";
import "./Candidate.css";
import { HomeOutlined, LogoutOutlined } from "@ant-design/icons";
import DashboardHomeLink from "../../components/DashboardHomeLink";
import { useHR } from "../../components/HRContext";

const { Option } = Select;

const Candidate = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [candidateId, setCandidateId] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searchForm] = Form.useForm();
  const [attachmentUrl, setAttachmentUrl] = useState(null);
  const [candidateList, setCandidateList] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const navigate = useNavigate();
  const { hrName } = useHR();

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const email = localStorage.getItem("userEmail"); // ✅ Ensure this is set during login
        const allCandidates = await getCandidatesByHR(email);
        setCandidateList(allCandidates);

        if (id) {
          setIsEditing(true);
          const selectedCandidate = allCandidates.find((c) => c.id === id);
          console.log("Fetched candidates:", allCandidates);
          if (selectedCandidate) {
            form.setFieldsValue({
              ...selectedCandidate,
              entry_date: dayjs(selectedCandidate.entry_date),
              status_date: dayjs(selectedCandidate.status_date),
            });
            setAttachmentUrl(selectedCandidate.attachments);
          } else {
            message.error("Candidate not found!");
            navigate("/hr-dashboard/active-list");
          }
        }
      } catch (error) {
        message.error("Failed to fetch candidate details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [candidateId, form, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      message.success(`Selected file: ${selectedFile.name}`);
    } else {
      setFile(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCandidate(id);
      message.success("✅ Candidate deleted");
      fetchCandidates(); // refresh list
    } catch (err) {
      message.error(err || "❌ Failed to delete candidate");
    }
  };

  const handleCandidateClick = (candidate) => {
    console.log("Selected candidate:", candidate);
    message.info(`Selected: ${candidate.candidate_name}`);
    setSelectedCandidate(candidate);

    // ✅ Set editing mode and selected id
    setIsEditing(true);
    setCandidateId(candidate.id);

    // Set form values
    form.setFieldsValue({
      ...candidate,
      entry_date: candidate.entry_date ? dayjs(candidate.entry_date) : null,
      status_date: candidate.status_date ? dayjs(candidate.status_date) : null,
    });

    // Also set attachment (if resume uploaded previously)
    setAttachmentUrl(candidate.attachments);
  };

  const handleCandidateSearchByEmail = async (emailToSearch) => {
    try {
      const email = emailToSearch || form.getFieldValue("candidate_email_id");
      if (!email) {
        message.warning("Please enter a candidate email first.");
        return;
      }
      const response = await searchCandidateByEmail(email);
      if (response.message === "Candidate is in Rejected list") {
        message.error("❌ Candidate is in the Rejected list");
      } else if (response.message === "Candidate is already joined") {
        message.warning("⚠️ Candidate is already joined");
      } else if (response.message === "Candidate is already in Active List") {
        message.warning("⚠️ Candidate is already in Active List");
      } else if (response.message === "Candidate not found, you can proceed") {
        message.success("✅ No duplicates found. You can proceed!");
      } else {
        message.info(response.message);
      }
      return response;
    } catch (error) {
      console.error("❌ Error searching candidate:", error);
      message.error("Error checking candidate email. Try again.");
    }
  };

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
    message.info("Searching candidate...");
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
    setLoading(true);
    try {
      const candidateData = {
        ...values,
        entry_date: values.entry_date.format("YYYY-MM-DD"),
        status_date: values.status_date.format("YYYY-MM-DD"),
      };

      const email = candidateData.candidate_email_id;

      // Step 1: Upload resume first if file is selected
      if (file) {
        const response = await uploadResumeToAll(email, file);
        if (response?.candidateResume) {
          candidateData.attachments = response.candidateResume;
          setAttachmentUrl(response.candidateResume);
        }
      }

      // Step 2: Add or update candidate with attachments path
      if (isEditing && candidateId) {
        await updateCandidate(candidateId, candidateData);
        await updateActiveList(candidateData);
      } else {
        const result = await searchCandidateByEmail(email);
        if (!result?.message?.includes("proceed")) {
          throw new Error("Candidate already exists in system.");
        }

        await addCandidate(candidateData); // ✅ Now includes attachments
      }

      message.success(
        `Candidate ${isEditing ? "updated" : "added"} successfully!`
      );
      navigate("/hr-dashboard/active-list");
    } catch (error) {
      console.error("❌ Submission error:", error);
      message.error(
        `❌ Failed to ${isEditing ? "update" : "add"} candidate: ${
          error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <Spin size="large" className="candidate-spinner" />;
  }

  return (
    <div className="candidate-container">
      <div className="candidate-header">
        <div className="header-left">
          <img src="/images/hrms-logo.jpg" alt="logo" className="logo" />
          <DashboardHomeLink />
        </div>

        <h2>Candidates</h2>

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

      <div className="candidate-body">
        <div className="candidate-sidebar">
          <h3>Candidate List</h3>
          <div className="candidate-list">
            {candidateList.length > 0 ? (
              candidateList.map((candidate) => (
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
              <p>No candidates found.</p>
            )}
          </div>
        </div>

        <div className="candidate-content">
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
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              progress_status: "Application Received",
              experience: 0,
            }}
            className="candidate-form"
          >
            {/* 🔥 HR Details */}
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="HR_name" label="HR Name">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="HR_mail" label="HR Email">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="entry_date" label="Entry Date">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="candidate_name" label="Candidate Name">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="candidate_email_id" label="Candidate Email">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="contact_number" label="Contact Number">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="profile_stage" label="Profile Stage">
                  <Select>
                    <Option value="Open">Open</Option>
                    <Option value="Closed">Closed</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="current_company" label="Current Company">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="current_location" label="Current Location">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="permanent_location" label="Permanent Location">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="qualification" label="Qualification">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="experience" label="Experience (Years)">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="skills" label="Skills">
                  <Select mode="tags" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="current_ctc" label="Current CTC">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="expected_ctc" label="Expected CTC">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="reference" label="Reference">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="position" label="Position">
                  <Select>
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
              </Col>

              <Col span={8}>
                <Form.Item name="department" label="Department">
                  <Select>
                    {[
                      "IT",
                      "EMDB",
                      "Accounts",
                      "Financial",
                      "Python",
                      "Engineering",
                    ].map((d) => (
                      <Option key={d} value={d}>
                        {d}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="progress_status" label="Progress Status">
                  <Select>
                    {[
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
                    ].map((status) => (
                      <Option key={status} value={status}>
                        {status}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="status_date" label="Status Date">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="experience" label="Experience (Years)">
                  <InputNumber
                    min={0}
                    placeholder="Enter years of experience"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="Band" label="Band">
                  <Select placeholder="Select Band">
                    {["L0", "L1", "L2", "L3", "L4"].map((Band) => (
                      <Option key={Band} value={Band}>
                        {Band}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="notice_period" label="Notice Period">
                  <Input placeholder="Enter notice period" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="comments" label="Comments">
                  <Input.TextArea placeholder="Add any comments" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item label="Upload Resume">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </Form.Item>

                {attachmentUrl && (
                  <Form.Item label="Resume Preview">
                    <a
                      href={`http://localhost:5000/api/uploads/${attachmentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => message.info("Opening resume preview")}
                      style={{ display: "inline-block", marginTop: 4 }}
                    >
                      📄 View Resume
                    </a>
                  </Form.Item>
                )}
              </Col>

              <Col xs={24}>
                <Form.Item className="form-submit">
                  <div className="form-actions">
                    <Button
                      type="primary"
                      htmlType="submit"
                      block={false} // keep it normal width
                      loading={loading}
                    >
                      {isEditing ? "Update Candidate" : "Add Candidate"}
                    </Button>

                    {isEditing && candidateId && (
                      <Button
                        danger
                        block={false}
                        style={{ marginLeft: "10px" }}
                        onClick={() => handleDelete(candidateId)} // pass correct id
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Candidate;
