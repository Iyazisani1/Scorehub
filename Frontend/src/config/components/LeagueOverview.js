import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { footballDataApi, LEAGUE_DATA } from "../config/apiConfig";
import StandingsPage from "./StandingsPage";
import TopScorers from "./TopScorers";
import { MatchCard } from "./MatchCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LeagueOverview() {
  const { id: leagueId } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSeason, setSelectedSeason] = useState("2024");
  const [seasons, setSeasons] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const leagueData = LEAGUE_DATA[leagueId?.toUpperCase()] || {};
  const leagueName = leagueData.name || "League";
  const leagueEmblem = leagueData.emblem || "";

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        const competitionCode = LEAGUE_DATA[leagueId?.toUpperCase()]?.code;
        if (!competitionCode) {
          throw new Error("Invalid league ID");
        }

        const response = await footballDataApi.get(
          `/competitions/${competitionCode}/matches?season=${selectedSeason}`
        );

        if (response.data && response.data.matches) {
          console.log("Fetched matches:", response.data.matches);
          setMatches(response.data.matches);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error("Matches Fetch Error:", err);
        setError(err.message || "Failed to fetch matches");
      } finally {
        setLoading(false);
      }
    };

    if (leagueId) fetchMatches();
  }, [leagueId, selectedSeason]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const newSeasons = [];
    for (let i = 0; i < 5; i++) {
      newSeasons.push(`${currentYear - i - 1}`);
    }
    setSeasons(newSeasons);
  }, []);

  const handlePrevMatch = () => {
    setCurrentMatchIndex((prevIndex) =>
      prevIndex === 0 ? matches.length - 1 : prevIndex - 1
    );
  };

  const handleNextMatch = () => {
    setCurrentMatchIndex((prevIndex) =>
      prevIndex === matches.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (error) {
    return (
      <div className="p-4 text-white bg-gray-900 min-h-screen">
        <div className="bg-red-900/50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error Loading League Data</h2>
          <p className="text-gray-300">
            Please check the league ID and try again.
          </p>
          <p className="text-gray-400 mt-2">
            Available leagues: {Object.keys(LEAGUE_DATA).join(", ")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      <div className="bg-gray-800 p-6 rounded-lg flex justify-between items-center">
        <div className="flex items-center">
          {leagueEmblem && (
            <img
              src={leagueEmblem}
              alt={`${leagueName} emblem`}
              className="w-10 h-10 mr-4"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{leagueName}</h1>
            <p className="text-gray-400">Competition</p>
          </div>
        </div>
        <select
          className="bg-gray-700 text-white p-2 rounded"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
        >
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 flex space-x-6 border-b border-gray-700 pb-2">
        {[
          { id: "overview", label: "Overview" },
          { id: "table", label: "Table" },
          { id: "topscorers", label: "Top Scorers" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`text-lg ${
              activeTab === tab.id
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-400"
            } pb-1`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "overview" && matches.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Matches</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="relative">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handlePrevMatch}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-300" />
                </button>
                <div className="flex space-x-4">
                  {matches
                    .slice(currentMatchIndex, currentMatchIndex + 3)
                    .map((match) => (
                      <div
                        key={match.id}
                        className="p-4 bg-gray-800 rounded-lg"
                      >
                        <MatchCard match={match} />
                      </div>
                    ))}
                </div>
                <button
                  onClick={handleNextMatch}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <ChevronRight className="h-6 w-6 text-gray-300" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === "table" && (
        <div className="mt-6">
          <StandingsPage leagueId={leagueId} season={selectedSeason} />
        </div>
      )}
      {activeTab === "topscorers" && (
        <div className="mt-6">
          <TopScorers leagueId={leagueId} season={selectedSeason} />
        </div>
      )}
    </div>
  );
}
