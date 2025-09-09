import axiosInstance from ".";

export const addHR = async (hrData) => {
  try {
    const response = await axiosInstance.post("/api/hr/add", hrData);
    return response.data;
  } catch (error) {
    console.error("Error adding HR:", error);
    throw error;
  }
};

export const getHRS = async () => {
  try {
    const response = await axiosInstance.get("/api/hr/fetch");
    return response.data;
  } catch (error) {
    console.error("Error fetching HRs:", error);
    throw error;
  }
};

export const saveUpdateHR = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/hr/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating and saving HR:", error);
    throw error;
  }
};
