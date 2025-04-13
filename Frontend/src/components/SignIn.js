import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignIn({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4001/api/user/signin",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token, message } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("username", response.data.user.username);

      setMessage(message);
      localStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);

      navigate("/");
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-[#1a1f2c] text-white">
      <div className="justify-center text-center w-full max-w-md m-3 p-6 bg-[#2a2f3c] shadow-xl rounded-lg">
        <h2 className="font-bold text-xl mb-6 text-white">Sign In</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            className="w-full p-2 mb-4 bg-[#1a1f2c] border border-gray-600 rounded text-white placeholder-gray-400"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <input
            type="password"
            className="w-full p-2 mb-4 bg-[#1a1f2c] border border-gray-600 rounded text-white placeholder-gray-400"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
          >
            Sign In
          </button>
        </form>

        <div className="mt-4">
          <Link
            to="/forgot-password"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="mt-6 text-gray-300">
          <span className="text-sm">Not Registered? </span>
          <Link to="/register" className="text-blue-400 hover:text-blue-300">
            Register now!
          </Link>
        </div>

        {message && <p className="text-red-400 mt-4">{message}</p>}
      </div>
    </div>
  );
}
