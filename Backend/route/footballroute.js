import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = "https://api.football-data.org/v4";

router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log("API Key present:", !!API_KEY);
  next();
});

router.get("/matches/:leagueId", async (req, res) => {
  const { leagueId } = req.params;

  try {
    console.log(`Attempting to fetch matches for league ${leagueId}`);
    console.log(`Request URL: ${BASE_URL}/competitions/${leagueId}/matches`);

    if (!API_KEY) {
      throw new Error("API key is not configured");
    }

    const response = await axios.get(
      `${BASE_URL}/competitions/${leagueId}/matches`,
      {
        headers: {
          "X-Auth-Token": API_KEY,
        },
        params: {
          season: 2024,
        },
      }
    );

    console.log("Matches API response status:", response.status);
    res.json(response.data);
  } catch (error) {
    console.error("Detailed error information:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);

    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || "Internal server error",
      details: error.response?.data || error.message,
    });
  }
});

router.get("/standings/:leagueId", async (req, res) => {
  const { leagueId } = req.params;

  try {
    console.log(`Attempting to fetch standings for league ${leagueId}`);

    if (!API_KEY) {
      throw new Error("API key is not configured");
    }

    const response = await axios.get(
      `${BASE_URL}/competitions/${leagueId}/standings`,
      {
        headers: {
          "X-Auth-Token": API_KEY,
        },
        params: {
          season: 2024,
        },
      }
    );

    console.log("Standings API response status:", response.status);
    res.json(response.data);
  } catch (error) {
    console.error("Detailed error information:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);

    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || "Internal server error",
      details: error.response?.data || error.message,
    });
  }
});

export default router;
