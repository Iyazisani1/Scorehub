import express from "express";
import {
  Register,
  verifyOTP,
  SignIn,
  requestPasswordReset,
  resetPassword,
  getProfile,
  updateProfile,
  verifyResetToken,
  submitPrediction,
  evaluatePredictions,
  getLeaderboard,
} from "../controller/User.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", Register);
router.post("/verify-otp", verifyOTP);
router.post("/signin", SignIn);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/verify-reset-token/:token", verifyResetToken);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/predict", authMiddleware, submitPrediction);
router.post("/evaluate", authMiddleware, evaluatePredictions);
router.get("/leaderboard", getLeaderboard);

export default router;
