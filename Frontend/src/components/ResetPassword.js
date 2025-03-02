import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyResetToken, resetPassword } from "../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        await verifyResetToken(token);
        setIsVerifying(false);
      } catch (err) {
        setError("Invalid or expired reset link. Please request a new one.");
        setIsVerifying(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPassword(token, newPassword);
      setMessage(response.data.message);
      setError("");

      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return <div className="loading">Verifying reset link...</div>;
  }

  if (error && !message) {
    return (
      <div className="bg-[#1a1f2c] min-h-screen flex items-center justify-center text-white">
        <div className="bg-[#242937] p-8 rounded-lg shadow-lg w-full max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/forget-password")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1f2c] min-h-screen flex items-center justify-center text-white">
      <div className="bg-[#242937] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        {message && (
          <p className="text-green-500 mb-4">
            {message} Redirecting to login page...
          </p>
        )}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block mb-2">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
              className="w-full p-2 bg-[#1a1f2c] border border-gray-600 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              className="w-full p-2 bg-[#1a1f2c] border border-gray-600 rounded"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
