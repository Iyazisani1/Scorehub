import React, { useState, useEffect } from "react";
import { footballDataApi, LEAGUE_DATA } from "../config/apiConfig";

const StandingsPage = ({ leagueId, season }) => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const competitionCode = LEAGUE_DATA[leagueId]?.code;
        const response = await footballDataApi.get(
          `/competitions/${competitionCode}/standings?season=${season}`
        );
        setStandings(response.data.standings[0].table);
        setError(null);
      } catch (err) {
        console.error("Standings Fetch Error:", err);
        setError(err.response?.data?.message || "Failed to fetch standings");
      } finally {
        setLoading(false);
      }
    };
    if (leagueId) fetchStandings();
  }, [leagueId, season]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Standings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1e2330]">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400">#</th>
                <th className="px-4 py-3 text-left text-gray-400">Team</th>
                <th className="px-4 py-3 text-center text-gray-400">MP</th>
                <th className="px-4 py-3 text-center text-gray-400">W</th>
                <th className="px-4 py-3 text-center text-gray-400">D</th>
                <th className="px-4 py-3 text-center text-gray-400">L</th>
                <th className="px-4 py-3 text-center text-gray-400">GF</th>
                <th className="px-4 py-3 text-center text-gray-400">GA</th>
                <th className="px-4 py-3 text-center text-gray-400">GD</th>
                <th className="px-4 py-3 text-center text-gray-400">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {standings.map((standing) => (
                <tr
                  key={standing.team.id}
                  className="hover:bg-[#1e2330] transition-colors"
                >
                  <td className="px-4 py-3 text-gray-300">
                    {standing.position}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-white rounded-md p-1 mr-3">
                        <img
                          src={standing.team.crest}
                          alt={`${standing.team.name} crest`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-white">{standing.team.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">
                    {standing.playedGames}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">
                    {standing.won}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">
                    {standing.draw}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">
                    {standing.lost}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">
                    {standing.goalsFor}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">
                    {standing.goalsAgainst}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">
                    {standing.goalDifference}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-white">
                    {standing.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StandingsPage;
