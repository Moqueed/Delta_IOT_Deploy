// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { message } from "antd";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    console.warn("🚫 No token found in localStorage");
    message.error("Please log in first!");
    return <Navigate to="/login" replace />;
  }

  if (!userRole) {
    console.warn("🚫 No role found in localStorage");
    message.error("Unauthorized access!");
    return <Navigate to="/unauthorized" replace />;
  }

  const allowedRoles = Array.isArray(role)
    ? role.map((r) => r.toLowerCase())
    : [role.toLowerCase()];

  if (!allowedRoles.includes(userRole.toLowerCase())) {
    message.error("Unauthorized access!");
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
