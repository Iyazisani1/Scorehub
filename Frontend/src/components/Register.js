import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = formData;
    if (!username || !email || !password || !confirmPassword) {
      setMessage("Please fill all fields");
      return false;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:4001/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Registration successful! Please check your email for OTP");
        navigate("/verify-otp", { state: { email: formData.email } });
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
      <div className="justify-center text-center w-full max-w-md m-3 p-6 shadow-xl border-2 border-neutral-800 rounded-lg">
        <h2 className="font-bold text-xl mb-6">Register</h2>
        {!verificationSent ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border border-neutral-800 rounded p-2"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-neutral-800 rounded p-2"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-neutral-800 rounded p-2"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border border-neutral-800 rounded p-2"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-green-600 mb-4">Registration successful!</p>
            <p className="mb-4">
              Please check your email for the verification code.
            </p>
          </div>
        )}

        <div className="mt-6">
          <p className="text-sm">
            Already Registered?{" "}
            <Link
              to="/signin"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Sign In!
            </Link>
          </p>
        </div>

        {message && (
          <p className="text-red-600 font-semibold mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}

export default Register;
