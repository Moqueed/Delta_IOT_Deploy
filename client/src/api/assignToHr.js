import axiosInstance from ".";

//Add a new candidate
export const assignCandidateToHR = async (formData) => {
  try {
    const response = await axiosInstance.post(
      "/api/assignedCandidate/assign",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // for sending files
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

//search the candidate
export const searchAssignments = async (filters) => {
  try {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v && v.trim() !== "")
    );
    const response = await axiosInstance.get("/api/assign-to-hr/search", {
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch " };
  }
};

//Fetch all candidates
export const fetchAllNewCandidates = async () => {
  try {
    const response = await axiosInstance.get("/api/assign-to-hr/fetch");
    return response.data;
  } catch (error) {
    console.error("Error fetching new candidates:", error);
    throw error;
  }
};
