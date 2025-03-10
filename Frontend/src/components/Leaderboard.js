import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { useUserPoints } from "./Points";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Leaderboard = () => {
  const { userId, token } = useUserPoints();
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();
  const isAuthenticated = !!token;

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeaderboard();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4001/api/user/leaderboard"
      );
      setLeaderboard(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[#1a1f2c] min-h-screen p-6 font-sans">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-[#242937] rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Please Sign In
            </h2>
            <p className="text-gray-400 mb-6">
              You need to be logged in to view the leaderboard.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1f2c] min-h-screen p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="text-yellow-400 w-6 h-6" />
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        </div>
        <div className="bg-[#242937] rounded-lg shadow-lg p-6">
          {leaderboard.length === 0 ? (
            <p className="text-gray-400 text-center">No scores recorded yet</p>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry._id}
                  className={`flex justify-between items-center p-4 rounded-lg ${
                    entry._id === userId
                      ? "bg-blue-500/20 border border-blue-500"
                      : "bg-[#2d3546]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold w-6">
                      {index + 1}.
                    </span>
                    <span className="text-white">
                      {entry.username} {entry._id === userId && "(You)"}
                    </span>
                  </div>
                  <span className="text-yellow-400 font-semibold">
                    {entry.points} points
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
