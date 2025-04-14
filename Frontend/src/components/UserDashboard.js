import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { User, Key } from "lucide-react";
import EditProfile from "./EditProfile";

export default function UserDashboard({ isAuthenticated, username }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    } else {
      fetchUserData();
    }
  }, [isAuthenticated, navigate]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:4001/api/user/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch user data");
      navigate("/signin");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleProfileUpdate = async (updatedData) => {
    console.log("Updating user data:", updatedData);
    // Fetch fresh user data after update
    await fetchUserData();
    setShowEditProfile(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f2c] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f2c] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">User Dashboard</h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Profile Card */}
          <div className="bg-[#1e2433] rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Profile Information
              </h2>
              <button
                onClick={() => setShowEditProfile(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
              >
                Edit Profile
              </button>
            </div>

            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                {userData?.profilePhoto ? (
                  <img
                    src={`http://localhost:4001${userData.profilePhoto}`}
                    alt="Profile"
                    className="w-16 h-16 object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-white">
                  {userData?.username || username}
                </h2>
                <p className="text-gray-400">{userData?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleChangePassword}
                className="w-full flex items-center justify-center px-4 py-2 bg-[#374151] text-white text-sm font-medium rounded hover:bg-gray-600 transition-colors"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEditProfile && (
        <EditProfile
          userData={userData}
          onClose={() => setShowEditProfile(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}
