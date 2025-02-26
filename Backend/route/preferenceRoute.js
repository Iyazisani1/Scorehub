import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  initializePreferences,
  updateFantasyTeam,
  addPrediction,
  updateFavorites,
  getPredictionStats,
} from "../controller/preferenceController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", initializePreferences);
router.put("/fantasy-team", updateFantasyTeam);
router.post("/prediction", addPrediction);
router.put("/favorites", updateFavorites);
router.get("/prediction-stats", getPredictionStats);

export default router;
