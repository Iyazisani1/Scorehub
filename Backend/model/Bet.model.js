import mongoose from "mongoose";

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  matchId: {
    type: String,
    required: true,
  },
  homeTeam: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  competition: {
    type: String,
    required: true,
  },
  betAmount: {
    type: Number,
    required: true,
  },
  odds: {
    type: Number,
    required: true,
  },
  selectedOutcome: {
    type: String,
    required: true,
    enum: ["HOME", "DRAW", "AWAY"],
  },
  status: {
    type: String,
    enum: ["PENDING", "WON", "LOST"],
    default: "PENDING",
  },
  potentialWinnings: {
    type: Number,
    required: true,
  },
  matchDate: {
    type: Date,
    required: true,
  },
  placedAt: {
    type: Date,
    default: Date.now,
  },
  result: {
    type: String,
    default: null,
  },
});

const Bet = mongoose.model("Bet", betSchema);

export default Bet;
