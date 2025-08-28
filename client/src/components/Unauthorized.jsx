// pages/Unauthorized.jsx
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="403"
      title="403 - Unauthorized"
      subTitle="You are not authorized to view this page."
      extra={<Button type="primary" onClick={() => navigate("/")}>Back Home</Button>}
    />
  );
};

export default Unauthorized;
