import UserPreference from "../model/UserPreferenceModel.js";

export const initializePreferences = async (req, res) => {
  try {
    let preferences = await UserPreference.findOne({ userId: req.userId });

    if (!preferences) {
      preferences = await UserPreference.create({
        userId: req.userId,
      });
    }

    res.status(200).json(preferences);
  } catch (error) {
    console.error("Initialize preferences error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFantasyTeam = async (req, res) => {
  try {
    const { teamName, players } = req.body;

    if (!players || !Array.isArray(players)) {
      return res.status(400).json({ message: "Invalid players data" });
    }

    const preferences = await UserPreference.findOneAndUpdate(
      { userId: req.userId },
      {
        "fantasyTeam.name": teamName,
        "fantasyTeam.players": players,
      },
      { new: true }
    );

    res.status(200).json(preferences);
  } catch (error) {
    console.error("Update fantasy team error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addPrediction = async (req, res) => {
  try {
    const { matchId, homeTeamScore, awayTeamScore } = req.body;

    if (
      !matchId ||
      homeTeamScore === undefined ||
      awayTeamScore === undefined
    ) {
      return res.status(400).json({ message: "Invalid prediction data" });
    }

    // Check if prediction already exists for this match
    const existingPreference = await UserPreference.findOne({
      userId: req.userId,
      "predictions.matchId": matchId,
    });

    if (existingPreference) {
      return res
        .status(400)
        .json({ message: "Prediction already exists for this match" });
    }

    const prediction = {
      matchId,
      homeTeamScore,
      awayTeamScore,
      timestamp: new Date(),
    };

    const preferences = await UserPreference.findOneAndUpdate(
      { userId: req.userId },
      {
        $push: { predictions: prediction },
        $inc: { "predictionStats.totalPredictions": 1 },
      },
      { new: true, upsert: true }
    );

    res.status(200).json(prediction);
  } catch (error) {
    console.error("Add prediction error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFavorites = async (req, res) => {
  try {
    const { club, players } = req.body;

    const update = {};
    if (club) update.favoriteClub = club;
    if (players) update.favoritePlayers = players;

    const preferences = await UserPreference.findOneAndUpdate(
      { userId: req.userId },
      update,
      { new: true }
    );

    res.status(200).json(preferences);
  } catch (error) {
    console.error("Update favorites error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPredictionStats = async (req, res) => {
  try {
    const preferences = await UserPreference.findOne(
      { userId: req.userId },
      "predictionStats"
    );

    res.status(200).json(preferences.predictionStats);
  } catch (error) {
    console.error("Get prediction stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
