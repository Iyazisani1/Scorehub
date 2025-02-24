import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = "https://api.football-data.org/v4";

const fetchMatchIds = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/matches`, {
      headers: { "X-Auth-Token": API_KEY },
      params: { status: "SCHEDULED", limit: 10 }, // Fetch 10 upcoming matches
    });

    return response.data.matches.map((match) => ({
      id: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      matchUrl: `https://www.sofascore.com/${match.homeTeam.name}-vs-${match.awayTeam.name}/match-${match.id}`,
    }));
  } catch (error) {
    console.error("Error fetching match IDs:", error.message);
    return [];
  }
};

export default fetchMatchIds;
