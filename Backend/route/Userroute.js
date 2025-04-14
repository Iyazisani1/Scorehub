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
  changePassword,
} from "../controller/User.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/profiles";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "profile-" + uniqueSuffix + ext);
  },
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG and PNG files are allowed."),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Auth routes
router.post("/register", Register);
router.post("/verify-otp", verifyOTP);
router.post("/signin", SignIn);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/verify-reset-token", verifyResetToken);

// Protected routes
router.get("/profile", authMiddleware, getProfile);
router.put(
  "/profile",
  authMiddleware,
  upload.single("profilePhoto"),
  updateProfile
);
router.put("/change-password", authMiddleware, changePassword);

export default router;
