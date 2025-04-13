import express from "express";
import {
  Register,
  verifyOTP,
  SignIn,
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
  getProfile,
  updateProfile,
  submitPrediction,
  evaluatePredictions,
  getLeaderboard,
  changePassword,
  uploadProfileImage,
} from "../controller/User.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpg");
  },
});

const upload = multer({ storage: storage });

// Auth routes
router.post("/register", Register);
router.post("/verify-otp", verifyOTP);
router.post("/signin", SignIn);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/verify-reset-token/:token", verifyResetToken);

// Profile routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.post(
  "/upload-profile-image",
  authMiddleware,
  upload.single("profileImage"),
  uploadProfileImage
);

// Game routes
router.post("/predict", authMiddleware, submitPrediction);
router.post("/evaluate", authMiddleware, evaluatePredictions);
router.get("/leaderboard", getLeaderboard);

export default router;
