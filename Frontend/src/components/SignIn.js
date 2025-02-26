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

      // Store token in localStorage
      localStorage.setItem("token", token);

      setMessage(message);
      setIsAuthenticated(true);
      navigate("/");
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
      <div className="justify-center text-center w-full max-w-md m-3 p-6 shadow-xl border-2 border-neutral-800 rounded-lg">
        <h2 className="font-bold text-xl mb-6">Sign In</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            className="w-full p-2 mb-4 bg-[#1a1f2c] border border-gray-600 rounded"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <input
            type="password"
            className="w-full p-2 mb-4 bg-[#1a1f2c] border border-gray-600 rounded"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
          >
            Sign In
          </button>
        </form>

        <div className="mt-4">
          <Link
            to="/forgot-password"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="mt-6">
          <span className="text-sm">Not Registered? </span>
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Register now!
          </Link>
        </div>

        {message && <p className="text-red-600 mt-4">{message}</p>}
      </div>
    </div>
  );
}
