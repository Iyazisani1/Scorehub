import User from "../model/Usermodel.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import crypto from "crypto";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const Register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Generate OTP and set expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60000);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
      { email },
      {
        username,
        email,
        password: hashedPassword,
        otp,
        otpExpires,
        isVerified: false,
      },
      { upsert: true, new: true }
    );

    try {
      await transporter.sendMail({
        from: '"ScoreHub" <noreply@scorehub.com>',
        to: email,
        subject: "Email Verification",
        text: `Welcome to ScoreHub, ${username}! Your verification code is: ${otp}. This code will expire in 10 minutes.`,
        html: `
          <h1>Welcome to ScoreHub!</h1>
          <p>Hello ${username},</p>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        `,
      });

      return res.status(201).json({
        message: "Please check your email for verification code",
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Sign in successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpires = new Date(Date.now() + 10 * 60000);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await transporter.sendMail({
        from: '"ScoreHub" <noreply@scorehub.com>',
        to: email,
        subject: "Password Reset Request",
        text: `Click the following link to reset your password: ${resetUrl}. This link will expire in 10 minutes.`,
        html: `
          <h1>Password Reset Request</h1>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>Or copy and paste this link in your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 10 minutes.</p>
        `,
      });

      return res.status(200).json({
        message: "Password reset instructions sent to your email",
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
      return res.status(500).json({
        message: "Failed to send reset email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    return res
      .status(200)
      .json({ message: "Token is valid", email: user.email });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Please provide reset token and new password",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    user.username = username || user.username;
    user.email = email || user.email;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Error changing password" });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileImage = req.file;

    if (!profileImage) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store the image path or URL in the user's profile
    user.profileImage = `/uploads/profile/${profileImage.filename}`;
    await user.save();

    res.json({
      message: "Profile image uploaded successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ message: "Error uploading profile image" });
  }
};

export const submitPrediction = async (req, res) => {
  try {
    const {
      matchId,
      homeScore,
      awayScore,
      homeTeam,
      awayTeam,
      matchDate,
      competition,
    } = req.body;
    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return res
        .status(400)
        .json({ message: "Missing required prediction fields" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPrediction = {
      matchId,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      matchDate,
      competition,
      status: "PENDING",
      points: 0,
    };

    user.predictions = user.predictions.filter((p) => p.matchId !== matchId); // Remove old prediction if exists
    user.predictions.push(newPrediction);
    await user.save();

    return res
      .status(200)
      .json({ message: "Prediction submitted successfully" });
  } catch (error) {
    console.error("Submit prediction error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const evaluatePredictions = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let pointsEarned = 0;
    // Note: This is a simplified version. In reality, you'd need match result data from an API
    for (let prediction of user.predictions) {
      if (prediction.status === "PENDING") {
        // Simulate evaluation (replace with actual match result checking)
        const actualHomeScore = prediction.homeScore; // For demo, assume correct
        const actualAwayScore = prediction.awayScore;

        if (
          prediction.homeScore === actualHomeScore &&
          prediction.awayScore === actualAwayScore
        ) {
          prediction.status = "WON";
          prediction.points = 10;
          pointsEarned += 10;
        } else if (
          (prediction.homeScore > prediction.awayScore &&
            actualHomeScore > actualAwayScore) ||
          (prediction.homeScore < prediction.awayScore &&
            actualHomeScore < actualAwayScore) ||
          (prediction.homeScore === prediction.awayScore &&
            actualHomeScore === actualAwayScore)
        ) {
          prediction.status = "PARTIAL";
          prediction.points = 1;
          pointsEarned += 1;
        } else {
          prediction.status = "LOST";
          prediction.points = 0;
        }
      }
    }

    user.points += pointsEarned;
    await user.save();

    return res.status(200).json({
      message: "Predictions evaluated",
      pointsEarned,
      predictions: user.predictions,
    });
  } catch (error) {
    console.error("Evaluate predictions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find()
      .select("username points")
      .sort({ points: -1 })
      .limit(50);
    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Get leaderboard error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
