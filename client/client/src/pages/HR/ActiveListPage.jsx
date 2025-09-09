import React, { useEffect, useState } from "react";
import { Button, message, Spin } from "antd";
import axiosInstance from "../../api";
import CandidateForm from "./CandidateForm";
import "./ActiveList.css";
import "./CandidateForm.css";
import { LogoutOutlined } from "@ant-design/icons";
import DashboardHomeLink from "../../components/DashboardHomeLink";
import { useHR } from "../../components/HRContext";
import NotificationBell from "../../components/NotificationBell";

const ActiveList = () => {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const { hrName } = useHR();

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const hrEmail = localStorage.getItem("userEmail");
      if (!hrEmail) {
        message.error("HR email not found in localStorage.");
        return;
      }

      const response = await axiosInstance.get(
        `/api/activelist/by-hr/${hrEmail}`
      );
      setCandidates(response.data);
      if (response.data.length > 0) {
        setSelectedCandidate(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching HR-specific candidates:", error);
      message.error("Failed to fetch candidates.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout successfully");
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  if (loading) {
    return <Spin size="large" className="loading-spinner" />;
  }

  return (
    <div className="active-list-layout">
      <div className="active-list-header">
        <div className="header-left">
          <img src="/images/hrms-logo.jpg" alt="logo" className="logo" />
          <DashboardHomeLink />
        </div>

        <h2>Active List</h2>

        <div className="header-right">
          <NotificationBell/>
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

      <div className="active-list-body">
        <div className="candidate-sidebar">
          <h3>Active candidates List</h3>
          <ul className="candidate-list">
            {candidates.map((candidate) => (
              <div key={candidate.candidate_id} className="candidate-wrapper">
                <li
                  key={candidate.candidate_id}
                  className={`candidate-item ${
                    selectedCandidate?.candidate_id === candidate.candidate_id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  {candidate.candidate_name}
                </li>
              </div>
            ))}
          </ul>
        </div>
        <div className="candidate-form-wrapper">
          {selectedCandidate ? (
            <CandidateForm
              key={selectedCandidate.candidate_id}
              candidate={selectedCandidate}
              onUpdate={fetchCandidates}
            />
          ) : (
            <div className="no-candidate-selected">
              Select a candidate to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveList;
