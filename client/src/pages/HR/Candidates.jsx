import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Spin,
  InputNumber,
  Row,
  Col,
  App, // ✅ import App
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

  // ✅ AntD v5 message hook
  const { message } = App.useApp();

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const email = localStorage.getItem("userEmail");
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

    setIsEditing(true);
    setCandidateId(candidate.id);

    form.setFieldsValue({
      ...candidate,
      entry_date: candidate.entry_date ? dayjs(candidate.entry_date) : null,
      status_date: candidate.status_date ? dayjs(candidate.status_date) : null,
    });

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

      if (file) {
        const response = await uploadResumeToAll(email, file);
        if (response?.candidateResume) {
          candidateData.attachments = response.candidateResume;
          setAttachmentUrl(response.candidateResume);
        }
      }

      if (isEditing && candidateId) {
        await updateCandidate(candidateId, candidateData);
        await updateActiveList(candidateData);
      } else {
        const result = await searchCandidateByEmail(email);
        if (!result?.message?.includes("proceed")) {
          throw new Error("Candidate already exists in system.");
        }
        await addCandidate(candidateData);
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
            {/* form fields remain unchanged ... */}
            {/* I left them as-is since only message logic needed refactor */}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Candidate;
