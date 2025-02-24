import React, { useState, useEffect } from "react";
import { footballDataApi, LEAGUE_DATA } from "../config/apiConfig";

const TopScorers = ({ leagueId, season }) => {
  const [topScorers, setTopScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopScorers = async () => {
      try {
        setLoading(true);
        const competitionCode = LEAGUE_DATA[leagueId]?.code;
        if (!competitionCode) {
          throw new Error("Invalid league ID");
        }
        const response = await footballDataApi.get(
          `/competitions/${competitionCode}/scorers?season=${season}`
        );
        setTopScorers(response.data.scorers);
        setError(null);
      } catch (err) {
        console.error("Top Scorers Fetch Error:", err);
        setError(err.message || "Failed to fetch top scorers");
      } finally {
        setLoading(false);
      }
    };
    if (leagueId) fetchTopScorers();
  }, [leagueId, season]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-white">Top Scorers</h2>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topScorers.map((scorer, index) => (
            <div
              key={scorer.player.id}
              className="bg-[#1e2330] rounded-lg p-4 hover:bg-[#2a303f] transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg p-2">
                  <img
                    src={scorer.team.crest}
                    alt={`${scorer.team.name} crest`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-white truncate">
                    {scorer.player.name}
                  </p>
                  <p className="text-gray-400">{scorer.team.name}</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-white">
                    {scorer.goals}
                  </span>
                  <span className="text-sm text-gray-400">Goals</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-400">Games</p>
                  <p className="text-lg text-white">{scorer.playedMatches}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Assists</p>
                  <p className="text-lg text-white">{scorer.assists || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Penalties</p>
                  <p className="text-lg text-white">{scorer.penalties || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopScorers;
