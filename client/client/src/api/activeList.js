import { message } from "antd";
import axiosInstance from ".";

export const addToActiveList = async (candidateData) => {
  try {
    const response = await axiosInstance.post(
      "/api/activelist/add-active-list",
      candidateData
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to sync candidate to active list");
  }
};

export const updateActiveList = async (candidateData) => {
  const candidateId = candidateData.candidate_id;
  try {
    const response = await axiosInstance.put(
      `/api/activelist/update-active-list/${candidateId}`,
      candidateData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to Update Active List:", error);
    throw new Error(
      error.response?.data?.message || "Error Updating Active List"
    );
  }
};

export const changeStatus = async (email, status) => {
  try {
    const response = await axiosInstance.put(
      `/api/activeList/change-status/${email}`,
      { progress_status: status }
    );
    return response.data;
  } catch (error) {
    console.error("Error changing status:", error);
    throw error;
  }
};

export const requestReview = async (email, progressStatus, requestBy) => {
  try {
    const response = await axiosInstance.put(
      `/api/activeList/request-review/${email}`,
      {
        progress_status: progressStatus,
        requested_by: requestBy,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error requesting review:", error);
    throw error;
  }
};

//HR mail to manager
export const notifyManager = async (candidateId, progressStatus) => {
  try {
    const response = await axiosInstance.post(
      "/api/activelist/notify-manager",
      {
        candidate_id: candidateId,
        progress_status: progressStatus,
      }
    );
    message.success("Manager notified successfully");
    return response.data;
  } catch (error) {
    console.error("Error notifying manager:", error);
    const errorMsg =
      error.response?.data?.message || "Failed to notify manager.";
    message.error(errorMsg);
  }
};

//Total master data
export const UpdateTotalMasterData = async (id, progressStatus) => {
  try {
    const response = await axiosInstance.put(
      `/api/activelist/total-master-data/${id}`,
      {
        progress_status: progressStatus,
      }
    );
    message.success(response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error updating Total master Data:", error);
    const errorMsg =
      error.response?.data?.message || "Failed to update Total master data.";
    message.error(errorMsg);
  }
};

//About to Join
export const UpdateAboutToJoin = async (id, progressStatus) => {
  try {
    const response = await axiosInstance.put(
      `/api/activelist/about-to-join/${id}`,
      {
        progress_status: progressStatus,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating About To Join status:", error);
    const errorMsg =
      error.response?.data?.message || "Failed to update About To Join Status.";
  }
};

// Newly Joined
export const updateNewlyJoined = async (id, progressStatus) => {
  try {
    const response = await axiosInstance.put(
      `/api/activelist/newly-joined/${id}`,
      {
        progress_status: progressStatus,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating Newly Joined status:", error);
    const errorMsg = error.response?.data?.message;
  }
};

//Buffer Data
export const updateBufferData = async (id, progressStatus, statusReason) => {
  try {
    const response = await axiosInstance.put(
      `/api/activelist/buffer-data/${id}`,
      {
        progress_status: progressStatus,
        status_reason: statusReason,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating buffer Data status:", error);
    const errorMsg =
      error.response?.data?.message || "Failed to update Buffer data status.";
    message.error(errorMsg);
  }
};

//Rejected Data
export const updateRejectedCandidate = async (id,progress_status,rejection_reason) => {
  try {
    const response = await axiosInstance.put(
      `/api/activelist/rejected-data/${id}`,
      {
        progress_status: progress_status?.toLowerCase(),
        rejection_reason: rejection_reason || "Moved to rejected from Active List",
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error updating rejected candidate:", error);
    throw error;
  }
};

//fetch candidates for HR DataTracker
export const fetchFilteredCandidates = async (filters) => {
  const { status, hr_name, startDate, endDate } = filters;

  const params = {};
  if (status) params.status = status;
  if (hr_name) params.hr_name = hr_name;
  if (startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }

  try {
    const res = await axiosInstance.get("/api/activelist/filter", { params });
    return res.data;
  } catch (err) {
    console.error("❌ Failed to fetch filtered candidates:", err);
    throw err; // rethrow for caller to handle
  }
};

export const deleteActiveCandidate = async (candidateId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/activelist/delete/${candidateId}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting candidate:", error);
    throw error;
  }
};
