import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL, API_KEY } from "../config/apiConfig";

const MatchDetails = () => {
  const { matchId } = useParams();
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching match details for ID:", matchId);
        const response = await axios.get(`${BASE_URL}/matches/${matchId}`, {
          headers: { "X-Auth-Token": API_KEY },
        });
        console.log("API Response:", response.data);
        setMatchData(response.data);
      } catch (error) {
        console.error(
          "Match Details Fetch Error:",
          error.response ? error.response.data : error.message
        );
        setError("Failed to fetch match details");
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchMatchData();
    }
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-600 p-4 rounded-md flex items-center mb-4">
        <span className="text-white">{error}</span>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-white">No match data available</span>
      </div>
    );
  }

  const isUpcoming = matchData.status === "SCHEDULED";
  const isFinished = matchData.status === "FINISHED";

  return (
    <div className="bg-[#1a1f2c] min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-[#242937] p-6 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            {matchData.homeTeam.name} vs {matchData.awayTeam.name}
          </h1>
          <p className="text-gray-400">
            {new Date(matchData.utcDate).toLocaleString()} -{" "}
            {matchData.competition.name}
          </p>
          {matchData.venue && (
            <p className="text-gray-400 mt-2">🏟 Venue: {matchData.venue}</p>
          )}
        </div>

        <div className="flex justify-center items-center gap-8 mb-8">
          <div className="text-center">
            <img
              src={matchData.homeTeam.crest || "/placeholder-team.png"}
              alt={matchData.homeTeam.name}
              className="w-20 h-20 mx-auto mb-2"
            />
            <h2 className="text-white font-bold">{matchData.homeTeam.name}</h2>
          </div>

          <div className="text-center">
            {isFinished ? (
              <div className="text-4xl font-bold text-white">
                {matchData.score.fullTime.home} -{" "}
                {matchData.score.fullTime.away}
              </div>
            ) : isUpcoming ? (
              <div className="text-xl text-yellow-400">Upcoming</div>
            ) : (
              <div className="text-xl text-green-400">Live</div>
            )}
          </div>

          <div className="text-center">
            <img
              src={matchData.awayTeam.crest || "/placeholder-team.png"}
              alt={matchData.awayTeam.name}
              className="w-20 h-20 mx-auto mb-2"
            />
            <h2 className="text-white font-bold">{matchData.awayTeam.name}</h2>
          </div>
        </div>

        {isFinished && matchData.events && matchData.events.length > 0 && (
          <div className="bg-[#2d3546] p-4 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-white mb-4">Match Events</h3>
            <ul className="text-gray-400">
              {matchData.events.map((event, index) => (
                <li key={index} className="py-2 flex justify-between">
                  <span className="text-white">{event.minute}’</span>
                  <span>
                    {event.player} ({event.team})
                  </span>
                  {event.eventType === "GOAL" && (
                    <span className="text-green-400">⚽ Goal</span>
                  )}
                  {event.eventType === "YELLOW_CARD" && (
                    <span className="text-yellow-400">🟨 Yellow Card</span>
                  )}
                  {event.eventType === "RED_CARD" && (
                    <span className="text-red-400">🟥 Red Card</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isUpcoming && matchData.head2head && (
          <div className="bg-[#2d3546] p-4 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">
              Head to Head Stats
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="text-gray-400">
                <p className="text-2xl font-bold text-white">
                  {matchData.head2head.numberOfMatches}
                </p>
                <p>Total Matches</p>
              </div>
              <div className="text-gray-400">
                <p className="text-2xl font-bold text-white">
                  {matchData.head2head.homeTeam.wins}
                </p>
                <p>{matchData.homeTeam.name} Wins</p>
              </div>
              <div className="text-gray-400">
                <p className="text-2xl font-bold text-white">
                  {matchData.head2head.awayTeam.wins}
                </p>
                <p>{matchData.awayTeam.name} Wins</p>
              </div>
            </div>
          </div>
        )}

        {isFinished && (
          <div className="mt-4">
            <a
              href={`https://www.youtube.com/results?search_query=${matchData.homeTeam.name}+vs+${matchData.awayTeam.name}+highlights`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Watch Highlights on YouTube
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchDetails;
