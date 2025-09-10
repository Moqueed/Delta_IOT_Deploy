import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://delta-iot-deploy.onrender.com",
  headers: { "Content-Type": "application/json" },cd 
});

// ✅ Add token to headers if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
},
function (error) {
    return Promise.reject(error);
  }
);

export default axiosInstance;
