// DashboardHomeLink.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";

const DashboardHomeLink = () => {
  const [dashboardLink, setDashboardLink] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role")?.toLowerCase();
    if (role === "admin") setDashboardLink("/admin-dashboard");
    else if (role === "hr") setDashboardLink("/hr-dashboard");
    else setDashboardLink("/login");
  }, []);

  if (!dashboardLink) return null; // prevent premature render

  return (
    <Link to={dashboardLink}>
      <HomeOutlined className="home-icon" style={{ fontSize: "24px" }} />
    </Link>
  );
};

export default DashboardHomeLink;
