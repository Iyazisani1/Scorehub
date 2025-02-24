import express from "express";
import Match from "../model/Match.js";
import scrapeMatchEvents from "../Scraper/scrapeMatchEvents.js";
import fetchMatchIds from "../Scraper/fetchMatchIds.js"; // Import the correct function

const router = express.Router();

router.get("/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    let match = await Match.findOne({ matchId });

    if (!match || Date.now() - new Date(match.lastUpdated).getTime() > 300000) {
      console.log(`Fetching match data for ID: ${matchId}`);

      const allMatches = await fetchMatchIds();
      const matchToScrape = allMatches.find((m) => m.matchId === matchId);

      if (!matchToScrape) {
        return res.status(404).json({ error: "Match not found" });
      }

      const events = await scrapeMatchEvents(matchToScrape.matchUrl);

      match = await Match.findOneAndUpdate(
        { matchId },
        {
          matchId,
          homeTeam: matchToScrape.homeTeam,
          awayTeam: matchToScrape.awayTeam,
          events,
          lastUpdated: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    res.json({ ...match.toObject(), status: "success" });
  } catch (error) {
    console.error("Error fetching match details:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch match details", message: error.message });
  }
});

export default router;
