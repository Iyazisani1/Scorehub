import axios from "axios";

const fetchMatchIds = async () => {
  try {
    const response = await axios.get(
      "https://api.sofascore.com/api/v1/sport/football/scheduled-matches"
    );
    const matches = response.data.events.map((event) => ({
      matchId: event.id,
      homeTeam: event.homeTeam.name,
      awayTeam: event.awayTeam.name,
      matchUrl: `https://www.sofascore.com/football/${event.homeTeam.slug}-${event.awayTeam.slug}/${event.id}`,
    }));
    return matches;
  } catch (error) {
    console.error("Error fetching match IDs:", error);
    return [];
  }
};

export default fetchMatchIds;
