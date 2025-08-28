import axiosInstance from ".";

export const createNewApproval = async (approvalData) => {
  try {
    const response = await axiosInstance.post(
      "/api/approvals/newApproval",
      approvalData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating new approval:", error);
    throw error;
  }
};

export const savedApprovalDraft = async (approvalData) => {
  try {
    const response = await axiosInstance.post(
      "/api/approvals/approval/save",
      approvalData
    );
    return response.data;
  } catch (error) {
    console.error("Error saving draft:", error);
    throw error;
  }
};

export const updateApprovalById = async (id, updatedData) => {
  try {
    const response = await axiosInstance.put(
      `/api/approvals/approval/${id}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating approval:", error);
    throw error;
  }
};

export const reviewCandidateStatus = async (email, payload) => {
  try {
    const response = await axiosInstance.put(
      `/api/approvals/review-status/${email}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error updating review status:", error);
    throw error;
  }
};

export const cancelApprovalRequest = async (id) => {
  try {
    const response = await axiosInstance.put(`/api/approvals/cancel/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error cancelling approval request:", error);
    throw error;
  }
};
