import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOTP = ({ setIsAuthenticated }) => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setMessage("Please enter OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4001/api/user/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Email verified successfully");
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } else {
        setMessage(data.message || "Verification failed");
      }
    } catch (error) {
      setMessage("An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <p className="text-red-600">
            No email address provided. Please register first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-[#1a1f2c]">
      <div className="w-full max-w-md p-6">
        <div className="bg-[#242937] rounded-lg shadow-xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Verify Your Email
          </h2>
          <p className="text-gray-400 mb-6 text-center">
            Please enter the OTP sent to {email}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full px-4 py-3 rounded-lg bg-[#2d3546] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-center ${
                message.includes("success") ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
