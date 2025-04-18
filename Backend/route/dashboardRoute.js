import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const dashboardData = {
      stats: {
        totalBets: 0,
        wonBets: 0,
        lostBets: 0,
        totalCoins: 1000,
      },
      recentBets: [],
      recentMatches: [],
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

router.get("/history", authMiddleware, async (req, res) => {
  try {
    res.status(200).json([]);
  } catch (error) {
    console.error("Error fetching betting history:", error);
    res.status(500).json({ message: "Failed to fetch betting history" });
  }
});

router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const stats = {
      totalBets: 0,
      wonBets: 0,
      lostBets: 0,
      winRate: 0,
      totalCoins: 1000,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Failed to fetch user stats" });
  }
});

export default router;
