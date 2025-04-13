import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { X } from "lucide-react";

function EditProfile({ userData, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    profilePhoto: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || "",
        email: userData.email || "",
        profilePhoto: null,
      });
      setPreviewUrl(userData.profileImage || null);
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        toast.error("Please upload a JPEG or PNG image");
        return;
      }
      setFormData((prev) => ({ ...prev, profilePhoto: file }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // First, update username and email if needed
      if (
        formData.username !== userData.username ||
        formData.email !== userData.email
      ) {
        await axios.put(
          "http://localhost:4001/api/user/profile",
          {
            username: formData.username,
            email: formData.email,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Then, upload profile photo if a new one was selected
      if (formData.profilePhoto) {
        const imageFormData = new FormData();
        imageFormData.append("profileImage", formData.profilePhoto);

        await axios.post(
          "http://localhost:4001/api/user/upload-profile-image",
          imageFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      toast.success("Profile updated successfully");

      // Fetch updated user data
      const response = await axios.get(
        "http://localhost:4001/api/user/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1e2433] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full p-2 bg-[#2a2f3c] text-white rounded border border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 bg-[#2a2f3c] text-white rounded border border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Profile Photo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white text-xl">
                      {formData.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".png,.jpeg,.jpg"
                onChange={handlePhotoChange}
                className="flex-1 p-2 bg-[#2a2f3c] text-white rounded border border-gray-600"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
