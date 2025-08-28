import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteVacancy } from "../../api/hrVacancy";
import { Button, message, Popconfirm, Spin, Table } from "antd";
import { HomeOutlined, LogoutOutlined } from "@ant-design/icons";
import "./HRVacancy.css";
import DashboardHomeLink from "../../components/DashboardHomeLink";
import axiosInstance from "../../api";
import { useHR } from "../../components/HRContext";
import NotificationBell from "../../components/NotificationBell";

const HRVacancy = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [vacanciesList, setVacanciesList] = useState([]);
  const navigate = useNavigate();
  const { hrName } = useHR();

  const fetchVacancies = async () => {
  try {
    setLoading(true);

    const email = localStorage.getItem("userEmail");
    console.log("📧 Fetched email from localStorage:", email);

    if (!email) {
      message.error("No email found in localStorage.");
      return;
    }

    const res = await axiosInstance.get(`/api/hrvacancies/by-email/${email}`);
    const data = res.data;
    console.log("✅ Vacancies:", data);

    setVacancies(data);
  } catch (error) {
    console.error("❌ Error fetching vacancies:", error);
    message.error("Failed to load vacancies");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchVacancies();
  }, []);

  const handleDelete = async (job_id) => {
    try {
      await deleteVacancy(job_id);
      message.success("Vacancy deleted successfully!");
      fetchVacancies();
    } catch (error) {
      message.error("Failed to delete vacancy");
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout successfully");
    window.location.href = "/login";
  };

  const columns = [
    { title: "Job ID", dataIndex: "job_id", key: "job_id" },
    { title: "Position", dataIndex: "position", key: "position" },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Vacancy", dataIndex: "vacancy", key: "vacancy" },
    {
      title: "Experience",
      key: "experience",
      render: (_, record) =>
        `${record.minimum_experience} - ${record.maximum_experience} years`,
    },
    {
      title: "Skills",
      dataIndex: "skills",
      key: "skills",
      render: (skills) => (
        <>
          {Array.isArray(skills)
            ? skills.map((skill, index) => (
                <span key={index}>
                  {skill}
                  {index < skills.length - 1 && ", "}
                </span>
              ))
            : skills}
        </>
      ),
    },
    {
      title: "Job Description",
      dataIndex: "job_description",
      key: "job_description",
    },
    {
      title: "HRs",
      dataIndex: "HRs",
      key: "HRs",
      render: (HRs) => (
        <>
          {Array.isArray(HRs)
            ? HRs.map((hr, index) => (
                <span key={index}>
                  {hr}
                  {index < HRs.length - 1 && ", "}
                </span>
              ))
            : HRs}
        </>
      ),
    },

    // {
    //   title: "Actions",
    //   key: "actions",
    //   render: (_, record) => (
    //     <>
    //       <Button
    //         type="link"
    //         onClick={() => console.log("View Details:", record.job_id)}
    //       >
    //         View
    //       </Button>
    //       <Popconfirm
    //         title="Are you sure you want to delete this vacancy?"
    //         onConfirm={() => handleDelete(record.job_id)}
    //         okText="Yes"
    //         cancelText="No"
    //       >
    //         <Button type="link" danger>
    //           Delete
    //         </Button>
    //       </Popconfirm>
    //     </>
    //   ),
    // },
  ];

  return (
    <div className="hr-vacancy-container">
      <div className="hr-vacancy-header">
        <div className="header-left">
          <img src="/images/hrms-logo.jpg" alt="logo" className="logo" />
          <DashboardHomeLink />
        </div>
        <div className="header-center">
          <h2 className="header-title">HR Vacancies</h2>
        </div>
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

      <div className="table-container">
        {/* <h2>Vacancies</h2> */}
        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={vacancies}
            columns={columns}
            rowKey="job_id"
            pagination={{ pageSize: 5 }}
          />
        )}
      </div>
    </div>
  );
};

export default HRVacancy;
