import React, { useState, useEffect } from "react";
import { Dice5, CalendarDays } from "lucide-react";
import { getMatches } from "../config/apiConfig";

const MatchPredictor = () => {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUpcomingMatches();
  }, []);

  const fetchUpcomingMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      // Adding more comprehensive debugging
      console.log("Fetching upcoming matches...");

      // Check for scheduled, timed, and in_play matches to ensure we get results
      const matches = await getMatches({
        status: ["SCHEDULED", "TIMED", "IN_PLAY"],
        limit: 20, // Increased limit to get more matches
      });

      console.log("API Response for upcoming matches:", matches);

      if (!matches || matches.length === 0) {
        console.warn("No upcoming matches found in the API response");
        setError("No upcoming matches available");
      } else {
        console.log(`Successfully fetched ${matches.length} upcoming matches`);
        setUpcomingMatches(matches);
      }
    } catch (err) {
      console.error("Failed to fetch upcoming matches:", err);
      setError(
        `Failed to fetch upcoming matches: ${err.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
    if (!predictions[match.id]) {
      setPredictions((prev) => ({
        ...prev,
        [match.id]: { homeScore: "", awayScore: "" },
      }));
    }
  };

  const handlePredictionSubmit = async (matchId) => {
    try {
      const prediction = {
        matchId,
        homeScore: parseInt(predictions[matchId].homeScore) || 0,
        awayScore: parseInt(predictions[matchId].awayScore) || 0,
        timestamp: new Date().toISOString(),
      };

      // Add match details to the prediction for display purposes
      const matchDetails = upcomingMatches.find(
        (match) => match.id === matchId
      );
      if (matchDetails) {
        prediction.homeTeam = matchDetails.homeTeam.name;
        prediction.awayTeam = matchDetails.awayTeam.name;
        prediction.date = matchDetails.localDate;
      }

      setPredictionHistory((prev) => [prediction, ...prev]);

      setSelectedMatch(null);
      setPredictions((prev) => ({
        ...prev,
        [matchId]: { homeScore: "", awayScore: "" },
      }));
    } catch (err) {
      console.error("Failed to submit prediction:", err);
      setError("Failed to submit prediction");
    }
  };

  // Function to retry fetching matches if none are found
  const retryFetchMatches = () => {
    fetchUpcomingMatches();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-red-600 p-4 rounded-md flex items-center mb-4">
          <span className="text-white">{error}</span>
        </div>
        <button
          onClick={retryFetchMatches}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid gap-6 grid-cols-1 md:grid-cols-2">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="text-blue-500" />
          <h2 className="text-xl font-bold text-white">Upcoming Matches</h2>
        </div>

        {upcomingMatches.length > 0 ? (
          <div className="space-y-4">
            {upcomingMatches.map((match) => (
              <div
                key={match.id}
                onClick={() => handleMatchSelect(match)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedMatch?.id === match.id
                    ? "bg-blue-500 border-2 border-blue-700 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                <div className="text-sm mb-2">
                  {match.localDate || "Date not available"}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {match.homeTeam?.name || "Unknown"}
                  </span>
                  <span className="mx-2">vs</span>
                  <span className="font-medium">
                    {match.awayTeam?.name || "Unknown"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            No upcoming matches found
            <button
              onClick={retryFetchMatches}
              className="block mx-auto mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        {selectedMatch ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Dice5 className="text-green-500" />
              <h2 className="text-xl font-bold text-white">Make Prediction</h2>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-2">
                {selectedMatch.homeTeam?.name || "Home Team"} vs{" "}
                {selectedMatch.awayTeam?.name || "Away Team"}
              </h3>
              <p className="text-gray-400">
                {selectedMatch.localDate || "Date not available"}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="mb-2 text-white">
                  {selectedMatch.homeTeam?.name || "Home Team"}
                </p>
                <input
                  type="number"
                  min="0"
                  className="w-20 text-center p-3 border rounded-lg bg-gray-700 text-white"
                  value={predictions[selectedMatch.id]?.homeScore}
                  onChange={(e) =>
                    setPredictions((prev) => ({
                      ...prev,
                      [selectedMatch.id]: {
                        ...prev[selectedMatch.id],
                        homeScore: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <span className="text-xl font-bold text-white">-</span>
              <div className="text-center">
                <p className="mb-2 text-white">
                  {selectedMatch.awayTeam?.name || "Away Team"}
                </p>
                <input
                  type="number"
                  min="0"
                  className="w-20 text-center p-3 border rounded-lg bg-gray-700 text-white"
                  value={predictions[selectedMatch.id]?.awayScore}
                  onChange={(e) =>
                    setPredictions((prev) => ({
                      ...prev,
                      [selectedMatch.id]: {
                        ...prev[selectedMatch.id],
                        awayScore: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                onClick={() => handlePredictionSubmit(selectedMatch.id)}
              >
                Submit Prediction
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Dice5 className="text-green-500" />
              <h2 className="text-xl font-bold text-white">Make Prediction</h2>
            </div>

            {predictionHistory.length > 0 ? (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Recent Predictions
                </h3>
                <div className="space-y-3">
                  {predictionHistory.slice(0, 3).map((pred, index) => (
                    <div key={index} className="bg-gray-700 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">
                        {pred.date || "Date not available"}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-200">
                          {pred.homeTeam || "Home"}
                        </span>
                        <span className="text-white font-bold">
                          {pred.homeScore} - {pred.awayScore}
                        </span>
                        <span className="text-gray-200">
                          {pred.awayTeam || "Away"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10">
                Select a match to make a prediction
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchPredictor;
