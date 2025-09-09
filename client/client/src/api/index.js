import axios from "axios";

// ✅ Detect environment and set API base URL
const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api" // local backend
    : "https://delta-iot-deploy.onrender.com/api"; // deployed backend

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Add token to headers if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
