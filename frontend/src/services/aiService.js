import api from "./axiosConfig";

export const askAI = async (prompt) => {
  const { data } = await api.post("/ai/ask", { prompt });
  return data;
};
