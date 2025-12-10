import axiosInstance from "../services/axiosConfig";

const dashboardService = {
  async getDashboard() {
    const response = await axiosInstance.get("/dashboard");
    return response.data;
  }
};

export default dashboardService;
