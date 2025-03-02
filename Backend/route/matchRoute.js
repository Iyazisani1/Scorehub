import express from "express";
import Match from "../model/Match.js";

const router = express.Router();

router.get("/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const match = await Match.findOne({ matchId });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json({ ...match.toObject(), status: "success" });
  } catch (error) {
    console.error("Error fetching match details:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch match details", message: error.message });
  }
});

export default router;
