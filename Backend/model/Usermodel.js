import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  resetToken: {
    type: String,
  },
  resetTokenExpires: {
    type: Date,
  },
  points: {
    type: Number,
    default: 0,
  },
  predictions: [
    {
      matchId: String,
      homeTeam: String,
      awayTeam: String,
      homeScore: Number,
      awayScore: Number,
      status: { type: String, default: "PENDING" },
      points: { type: Number, default: 0 },
      matchDate: Date,
      competition: String,
    },
  ],
});

const User = mongoose.model("User", userSchema);

export default User;
