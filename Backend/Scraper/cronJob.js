import cron from "node-cron";
import fetchMatchIds from "./fetchMatchIds.js";
import scrapeMatchEvents from "./scrapeMatchEvents.js";
import Match from "../model/Match.js";

cron.schedule("*/5 * * * *", async () => {
  console.log("Fetching match IDs from FBref...");
  const matches = await fetchMatchIds();

  if (matches.length === 0) {
    console.log("No matches found.");
    return;
  }

  for (const match of matches) {
    console.log(`Scraping match: ${match.homeTeam} vs ${match.awayTeam}`);

    const events = await scrapeMatchEvents(match.matchUrl);

    await Match.findOneAndUpdate(
      { matchId: match.matchUrl.split("/").pop() },
      { events, lastUpdated: new Date() },
      { upsert: true }
    );

    console.log(
      `Updated match events for ${match.homeTeam} vs ${match.awayTeam}`
    );
  }
});

export default cron;
