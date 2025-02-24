import mongoose from "mongoose";

const fantasyPlayerSchema = new mongoose.Schema({
  playerId: String,
  name: String,
  position: String,
  club: String,
});

const predictionSchema = new mongoose.Schema({
  matchId: String,
  homeTeamScore: Number,
  awayTeamScore: Number,
  timestamp: { type: Date, default: Date.now },
  points: { type: Number, default: 0 }, // Points earned for correct prediction
});

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fantasyTeam: {
      name: { type: String, default: "My Team" },
      players: [fantasyPlayerSchema],
      points: { type: Number, default: 0 },
    },
    predictions: [predictionSchema],
    favoriteClub: {
      clubId: String,
      name: String,
      league: String,
    },
    favoritePlayers: [
      {
        playerId: String,
        name: String,
        club: String,
        position: String,
      },
    ],
    predictionStats: {
      totalPredictions: { type: Number, default: 0 },
      correctPredictions: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const UserPreference = mongoose.model("UserPreference", userPreferenceSchema);
export default UserPreference;
