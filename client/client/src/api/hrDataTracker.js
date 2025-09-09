import axiosInstance from ".";

// ✅ Add a new HR Data Tracker Entry
export const addHRDataEntry = async (data) => {
  try {
    const response = await axiosInstance.post("/api/hr-data-tracker/add", data);
    return response.data;
  } catch (error) {
    console.error("Error adding HR data entry:", error);
    throw new Error(
      error.response?.data?.message || "Failed to add HR data entry"
    );
  }
};

// ✅ Get all HR Data Tracker Entries
export const getHRDataEntries = async () => {
  try {
    const response = await axiosInstance.get("/api/hr-data-tracker/fetch");
    return response.data;
  } catch (error) {
    console.error("Error fetching HR data entries:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch HR data entries"
    );
  }
};


export const updateCandidateAndTracker = async (id, updatedData) => {
  try {
    const response = await axiosInstance.put(
      `/api/hr-data-tracker/update/${id}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error updating candidate and tracker:", error);
    throw new Error(error.response?.data?.message || "Update failed");
  }
};

export const fetchFilteredTrackerFromActiveList = async (filters = {}) => {
  try {
    const { status, hr_name, startDate, endDate } = filters;

    const response = await axiosInstance.get(
      "/api/hr-data-tracker/filtered-from-activelist",
      {
        params: { status, hr_name, startDate, endDate },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching filtered tracker data from ActiveList:",
      error
    );
    throw error; // rethrow so the caller (e.g., `handleFilter`) can catch and show error message
  }
};

