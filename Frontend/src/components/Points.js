import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const UserPointsContext = createContext({
  userPoints: 0,
  addPoints: () => {},
  subtractPoints: () => {},
  resetPoints: () => {},
  userId: null,
  setUserId: () => {},
  getAllUsersPoints: () => {},
  token: null,
  setToken: () => {},
});

export const UserPointsProvider = ({ children }) => {
  const [userPoints, setUserPoints] = useState(0);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
      fetchUserProfile(storedToken, storedUserId);
    }
  }, []);

  const fetchUserProfile = async (authToken, id) => {
    try {
      const response = await axios.get(
        "http://localhost:4001/api/user/profile",
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setUserPoints(response.data.points);
    } catch (error) {
      console.error("Error fetching profile:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setToken(null);
      setUserId(null);
    }
  };

  const addPoints = async (points, id) => {
    // Points are managed server-side in evaluatePredictions
    const currentId = id || userId;
    if (currentId && token) {
      await fetchUserProfile(token, currentId);
    }
  };

  const subtractPoints = async () => {
    // Not implemented as per current requirements
  };

  const resetPoints = async () => {
    // Not implemented as per current requirements
  };

  const getAllUsersPoints = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4001/api/user/leaderboard"
      );
      return response.data.reduce((acc, user) => {
        acc[user._id] = user.points;
        return acc;
      }, {});
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return {};
    }
  };

  return (
    <UserPointsContext.Provider
      value={{
        userPoints,
        addPoints,
        subtractPoints,
        resetPoints,
        userId,
        setUserId,
        token,
        setToken,
        getAllUsersPoints,
      }}
    >
      {children}
    </UserPointsContext.Provider>
  );
};

export const useUserPoints = () => {
  const context = useContext(UserPointsContext);
  if (!context) {
    throw new Error("useUserPoints must be used within a UserPointsProvider");
  }
  return context;
};
