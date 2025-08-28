import axiosInstance from ".";


// Fetch all active positions
export const fetchPositions = async () => {
  try {
    const response = await axiosInstance.get("/api/positions/get-position");
    return response.data;
  } catch (error) {
    console.error("Error fetching positions:", error);
    throw error;
  }
};

// Create a new active position
export const createPosition = async (data) => {
  try {
    console.log("inside create position");
    
    const payload = {
      position: data.position?.trim(),
      skills: Array.isArray(data.skills)
        ? data.skills.map((skill) => skill.trim())
        : data.skills?.split(",").map((s) => s.trim()) || [],
      department: data.department?.trim(),
      vacancy: Number(data.vacancy) || 0, // ✅ your form uses `vacancies`, backend expects `vacancy`
      minimum_experience: Number(data.minimum_experience) || 0,
      maximum_experience: Number(data.maximum_experience) || 0,
      job_description: data.job_description?.trim(),
      HRs: Array.isArray(data.HRs)
        ? data.HRs.map((h) => h.trim())
        : data.HRs?.split(",").map((h) => h.trim()) || [],
    };

    console.log("📨 Sending payload:", JSON.stringify(payload, null, 2));

    const response = await axiosInstance.post("/api/positions/add-position", payload);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating position:", error.response?.data || error.message);
    throw error;
  }
};


// Update an existing active position
export const updatePosition = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/positions/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating position:", error);
    throw error;
  }
};

// Delete an active position
export const deletePosition = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/positions/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting position:", error);
    throw error;
  }
};
