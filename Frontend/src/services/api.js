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
  API.post("/user/request-reset", { email });

export const verifyResetToken = async (token) =>
  API.get(`/user/verify-reset-token/${token}`);

export const resetPassword = async (token, newPassword) =>
  API.post("/user/reset-password", { token, newPassword });

export const getUserPreferences = async (token) =>
  API.get("/preferences", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateUserPreferences = async (token, preferences) =>
  API.put("/preferences/favorites", preferences, {
    headers: { Authorization: `Bearer ${token}` },
  });
