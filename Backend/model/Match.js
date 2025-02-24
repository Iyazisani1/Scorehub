import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  events: [
    {
      minute: String,
      player: String,
      eventType: String,
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
});

const Match = mongoose.model("Match", matchSchema);

export default Match;
