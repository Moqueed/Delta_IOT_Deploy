import axiosInstance from ".";

//fetch total master data
export const fetchTotalMasterData = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/totaldata/total-master-data/fetch"
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching Total Master Data:", error);
  }
};

//fetch about to join
export const fetchAboutToJoin = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/totaldata/about-to-join/fetch"
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching Total Master Data:", error);
  }
};

//fetch newlyJoined
export const fetchNewlyJoined = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/totaldata/newly-joined/fetch"
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching Total Master Data:", error);
  }
};

//fetch BufferData
export const fetchBufferData = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/totaldata/buffer-data/fetch"
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching Total Master Data:", error);
  }
};
