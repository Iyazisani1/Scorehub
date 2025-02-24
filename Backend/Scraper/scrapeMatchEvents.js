import puppeteer from "puppeteer";

const scrapeMatchEvents = async (matchUrl) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(matchUrl, { waitUntil: "domcontentloaded" });

  const matchEvents = await page.evaluate(() => {
    const events = [];
    document.querySelectorAll(".event-row").forEach((row) => {
      events.push({
        minute: row.querySelector(".minute")?.innerText || "",
        player: row.querySelector(".player-name")?.innerText || "Unknown",
        eventType: row.querySelector(".event-icon")?.alt || "UNKNOWN",
      });
    });
    return events;
  });

  await browser.close();
  return matchEvents;
};

export default scrapeMatchEvents;
