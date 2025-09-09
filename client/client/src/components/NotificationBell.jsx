import React, { useEffect, useState } from "react";
import { Badge, Dropdown, message } from "antd";
import { BellOutlined } from "@ant-design/icons";
import axiosInstance from "../api";
import { useLocation } from "react-router-dom";

const NotificationBell = ({ refreshTrigger }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const location = useLocation();

  const fetchNotifications = async () => {
    try {
      const email = localStorage.getItem("userEmail");
      if (!email) return;

      // Fetch both types
      const [
        candidateRes,
        vacancyRes,
        activeListRes,
        approvalRes,
        totalMasterRes,
        aboutToJoinRes,
        newlyJoinedRes,
        bufferDataRes,
        rejectedRes,
        uploadRes,
      ] = await Promise.all([
        axiosInstance.get(`/api/notifications/${email}?type=candidate`),
        axiosInstance.get(`/api/notifications/${email}?type=vacancy`),
        axiosInstance.get(`/api/notifications/${email}?type=activeList`),
        axiosInstance.get(`/api/notifications/${email}?type=approval`),
        axiosInstance.get(`/api/notifications/${email}?type=totalMaster`),
        axiosInstance.get(`/api/notifications/${email}?type=aboutToJoin`),
        axiosInstance.get(`/api/notifications/${email}?type=newlyJoined`),
        axiosInstance.get(`/api/notifications/${email}?type=bufferData`),
        axiosInstance.get(`/api/notifications/${email}?type=rejected`),
        axiosInstance.get(`/api/notifications/${email}?type=upload`),
      ]);

      let merged = [
        ...candidateRes.data,
        ...vacancyRes.data,
        ...activeListRes.data,
        ...approvalRes.data,
        ...totalMasterRes.data,
        ...newlyJoinedRes.data,
        ...aboutToJoinRes.data,
        ...bufferDataRes.data,
        ...rejectedRes.data,
        ...uploadRes.data,
      ];

      // Filter based on current page
      if (location.pathname.includes("/hr-dashboard/active-list")) {
        merged = merged.filter((n) => n.type === "candidate" || n.type === "activeList");
      } else if (location.pathname.includes("/hr-dashboard/vacancies")) {
        merged = merged.filter((n) => n.type === "vacancy");
      } else if (location.pathname.includes("/admin-dashboard/approvals")) {
        merged = merged.filter((n) => n.type === "approval");
      } else if (location.pathname.includes("/total-data/total-master-data")) {
        merged = merged.filter((n) => n.type === "totalMaster");
      } else if (location.pathname.includes("/total-data/newly-joined")) {
        merged = merged.filter((n) => n.type === "newlyJoined");
      } else if (location.pathname.includes("/total-data/about-to-join")) {
        merged = merged.filter((n) => n.type === "aboutToJoin");
      } else if (location.pathname.includes("/total-data/buffer-data")) {
        merged = merged.filter((n) => n.type === "bufferData");
      } else if (location.pathname.includes("/total-data/rejected-data")) {
        merged = merged.filter((n) => n.type === "rejected");
      } else if (location.pathname.includes("/hr-dashboard/upload")) {
        merged = merged.filter((n) => n.type === "upload");
      }

      setNotifications(merged);
      setUnreadCount(merged.filter((n) => !n.read).length);
      console.log("🔎 Current Path:", location.pathname);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
      message.error("🔔 Failed to load notifications.");
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      await axiosInstance.put(`/api/notifications/read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("❌ Error marking notification:", err);
      message.error("❌ Failed to mark notification as read.");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [refreshTrigger]);

  // Build dropdown menu items
 const items = notifications.map((item) => ({
  key: item.id,
  label: (
    <div
      onClick={() => handleNotificationClick(item.id)}
      style={{
        cursor: "pointer",
        backgroundColor: item.read ? "#fff" : "#f6faff",
        padding: "6px 10px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <b>{item.title || "New Update"}</b>
        <div style={{ fontSize: "12px", color: "#555" }}>{item.message}</div>
      </div>

      {/* 🔵 Blue dot for unread */}
      {!item.read && (
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: "#1677ff", // Ant Design primary blue
            marginLeft: 8,
          }}
        ></span>
      )}
    </div>
  ),
}));


  return (
    <Dropdown
      menu={{ items }}
      trigger={["click"]}
      placement="bottomRight"
      overlayStyle={{ maxHeight: 300, overflowY: "auto", width: 320 }}
    >
      <Badge count={unreadCount} overflowCount={99}>
        <BellOutlined style={{ fontSize: "22px", cursor: "pointer" }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
