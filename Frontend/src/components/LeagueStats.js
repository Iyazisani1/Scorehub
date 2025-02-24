import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { footballDataApi, LEAGUE_DATA } from "../config/apiConfig";

const LeagueStats = () => {
  const { id: leagueId } = useParams();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const competitionCode = LEAGUE_DATA[leagueId]?.code;
        const response = await footballDataApi.get(
          `/competitions/${competitionCode}/stats`
        );
        setStats(response.data.stats);
        setError(null);
      } catch (err) {
        console.error("Stats Fetch Error:", err);
        setError("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    if (leagueId) fetchStats();
  }, [leagueId]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">League Stats</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ul className="space-y-4">
          {stats.map((stat) => (
            <li key={stat.type} className="flex items-center">
              <div>
                <p className="text-lg font-semibold">{stat.type}</p>
                <p className="text-gray-400">{stat.value}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LeagueStats;
