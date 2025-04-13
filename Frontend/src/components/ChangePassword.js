import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      console.log("Sending password change request with data:", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      const response = await axios.put(
        `${API_URL}/user/change-password`,
        {
          currentPassword: formData.currentPassword, // Changed back to currentPassword
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Password change response:", response); // Debug log

      if (response.status === 200) {
        toast.success("Password changed successfully");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      console.error("Error response:", error.response); // Debug log

      const errorMessage =
        error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);

      if (error.response?.status === 401) {
        toast.error("Current password is incorrect");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2c] flex flex-col items-center pt-8">
      <div className="w-full max-w-2xl px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Change Password</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-[#374151] text-white text-sm font-medium rounded hover:bg-gray-600 transition-colors"
          >
            Back to Profile
          </button>
        </div>

        <div className="bg-[#1e2433] rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                className="w-full bg-[#1a1f2c] text-white px-4 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full bg-[#1a1f2c] text-white px-4 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your new password"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full bg-[#1a1f2c] text-white px-4 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your new password"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-[#374151] text-white text-sm font-medium rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#3b82f6] text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Changing Password..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
