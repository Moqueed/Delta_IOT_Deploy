import axiosInstance from ".";

// ✅Upload Resume to Candidate, ActiveList, Approval
export const uploadResumeToAll = async (email, file) => {
  try {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await axiosInstance.post(
      `/api/uploads/upload/${email}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error uploading resume to ActiveList & Approval:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

//Upload Resume to AssignedToHR
export const uploadResumeToAssigned = async (email, file) => {
  try {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await axiosInstance.post(
      `/api/uploads/upload-assigned/${email}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error uploading resume to AssignedToHR:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};


// ✅ Get all uploaded resumes by an individual HR
export const getUploadsByHR = async (hrEmail) => {
  try {
    const response = await axiosInstance.get(`/api/uploads/list`, {
      params: { hr_email: hrEmail },
    });
    return response.data.files; // array of uploaded resume records
  } catch (error) {
    console.error("❌ Error fetching HR uploads:", error);
    throw error.response?.data || { message: "Could not fetch uploads" };
  }
};


//Fetch Resume File (Download or Display) In upload.js
export const fetchResumeFile = async (filename) => {
  try {
    const res = await axiosInstance.get(`/api/uploads/file/${filename}`, {
      responseType: "blob",
    });
    return res.data;
  } catch (err) {
    throw new Error("File download failed");
  }
};


