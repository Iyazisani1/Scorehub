import puppeteer from "puppeteer";

const scrapeMatchEvents = async (matchUrl) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(matchUrl, { waitUntil: "domcontentloaded" });

  const matchEvents = await page.evaluate(() => {
    const events = [];

    document.querySelectorAll(".sc-9410c37-0").forEach((eventRow) => {
      const minute = eventRow.querySelector(".sc-9410c37-1")?.innerText || "";
      const player =
        eventRow.querySelector(".sc-9410c37-3")?.innerText || "Unknown";
      const eventType = eventRow.querySelector("img")?.alt || "UNKNOWN";

      events.push({ minute, player, eventType });
    });

    return events;
  });

  await browser.close();
  return matchEvents;
};

export default scrapeMatchEvents;
