import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4001/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const requestPasswordReset = async (email) =>
  API.post("/request-reset", { email });
export const resetPassword = async (email, resetToken, newPassword) =>
  API.post("/reset-password", { email, resetToken, newPassword });
