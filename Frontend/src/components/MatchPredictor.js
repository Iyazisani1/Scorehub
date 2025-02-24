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
      const matches = await getMatches({
        status: ["SCHEDULED"],
        limit: 10,
      });
      setUpcomingMatches(matches);
    } catch (err) {
      setError("Failed to fetch upcoming matches");
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
    // Initialize prediction if not exists
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
        homeScore: parseInt(predictions[matchId].homeScore),
        awayScore: parseInt(predictions[matchId].awayScore),
        timestamp: new Date().toISOString(),
      };

      // Add to prediction history
      setPredictionHistory((prev) => [prediction, ...prev]);

      // Clear selection and prediction
      setSelectedMatch(null);
      setPredictions((prev) => ({
        ...prev,
        [matchId]: { homeScore: "", awayScore: "" },
      }));
    } catch (err) {
      setError("Failed to submit prediction");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid gap-6 grid-cols-1 md:grid-cols-2">
      {/* Upcoming Matches List */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="text-blue-500" />
          <h2 className="text-xl font-bold text-white">Upcoming Matches</h2>
        </div>

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
              <div className="text-sm mb-2">{match.localDate}</div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{match.homeTeam.name}</span>
                <span className="mx-2">vs</span>
                <span className="font-medium">{match.awayTeam.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prediction Form */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Dice5 className="text-green-500" />
          <h2 className="text-xl font-bold text-white">Make Prediction</h2>
        </div>

        {selectedMatch ? (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-2">
                {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
              </h3>
              <p className="text-gray-400">{selectedMatch.localDate}</p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="mb-2 text-white">{selectedMatch.homeTeam.name}</p>
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
                <p className="mb-2 text-white">{selectedMatch.awayTeam.name}</p>
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
          <div className="text-center text-gray-500 py-10">
            Select a match to make a prediction
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchPredictor;
