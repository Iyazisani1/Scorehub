import express from "express";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Basic team routes
router.get("/", async (req, res) => {
  try {
    // For now, return a simple success message
    res.status(200).json({ message: "Teams route working" });
  } catch (error) {
    console.error("Error in teams route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
