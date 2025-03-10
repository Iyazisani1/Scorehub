import React, { useState, useEffect } from "react";
import { Dice5, AlertCircle, Trophy } from "lucide-react";
import { getMatches, getMatchDetails, LEAGUE_DATA } from "../config/apiConfig";
import { useNavigate } from "react-router-dom";

const MatchPredictor = () => {
  const navigate = useNavigate();
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [predictions, setPredictions] = useState(
    () => JSON.parse(localStorage.getItem("predictions")) || {}
  );
  const [predictionHistory, setPredictionHistory] = useState(
    () => JSON.parse(localStorage.getItem("predictionHistory")) || []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showHistory, setShowHistory] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Filter matches function
  const filterMatches = (filter) => {
    setActiveFilter(filter);
    if (filter === "all") {
      setFilteredMatches(upcomingMatches);
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayString = today.toISOString().split("T")[0];
    const tomorrowString = tomorrow.toISOString().split("T")[0];

    const filtered = upcomingMatches.filter((match) =>
      filter === "today"
        ? match.dateString === todayString
        : match.dateString === tomorrowString
    );
    setFilteredMatches(filtered);
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Save predictions and history to localStorage
  useEffect(() => {
    localStorage.setItem("predictions", JSON.stringify(predictions));
  }, [predictions]);

  useEffect(() => {
    localStorage.setItem(
      "predictionHistory",
      JSON.stringify(predictionHistory)
    );
  }, [predictionHistory]);

  // Fetch upcoming matches
  useEffect(() => {
    fetchUpcomingMatches();
  }, []);

  // Filter matches when data or filter changes
  useEffect(() => {
    if (upcomingMatches.length > 0) {
      filterMatches(activeFilter);
    }
  }, [upcomingMatches, activeFilter]);

  const fetchUpcomingMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 7);

      const requestParams = {
        dateFrom: today.toISOString().split("T")[0],
        dateTo: futureDate.toISOString().split("T")[0],
        competitions: Object.values(LEAGUE_DATA).map((league) => league.id),
        status: ["SCHEDULED", "TIMED", "POSTPONED"],
        limit: 20,
      };

      const matches = await getMatches(requestParams);
      if (!matches || matches.length === 0) {
        throw new Error("No upcoming matches found");
      }

      const processedMatches = matches.map((match) => ({
        ...match,
        parsedDate: new Date(match.utcDate || match.localDate),
        dateString: (match.utcDate || match.localDate).split("T")[0],
      }));

      setUpcomingMatches(processedMatches);
      setFilteredMatches(processedMatches);
    } catch (err) {
      setError(err.message || "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  const handlePredictionChange = (matchId, field, value) => {
    if (value < 0) return;
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  const handlePredictionSubmit = (matchId) => {
    if (!isAuthenticated) {
      setError("Please sign in to make a prediction.");
      return;
    }

    const prediction = predictions[matchId];
    if (
      !prediction ||
      prediction.homeScore === undefined ||
      prediction.awayScore === undefined
    ) {
      setError("Please enter scores for both teams");
      return;
    }

    const currentDate = new Date();

    const newPrediction = {
      matchId,
      homeTeam: selectedMatch.homeTeam.name,
      awayTeam: selectedMatch.awayTeam.name,
      homeScore: parseInt(prediction.homeScore),
      awayScore: parseInt(prediction.awayScore),
      status: "PENDING",
      competition: selectedMatch.competition.name,
      matchDate: selectedMatch.localDate || selectedMatch.utcDate,
      predictionDate: currentDate.toISOString(),
    };

    setPredictionHistory((prev) => [
      newPrediction,
      ...prev.filter((p) => p.matchId !== matchId),
    ]);
    setSelectedMatch(null);
    setError(null);
    alert("Prediction saved! You can check the result after the match.");
  };

  const evaluatePredictions = async () => {
    const updatedHistory = [...predictionHistory];
    let evaluated = false;

    for (const prediction of updatedHistory) {
      if (prediction.status === "PENDING") {
        try {
          const matchDetails = await getMatchDetails(prediction.matchId);
          const match = matchDetails.data;

          if (match.status === "FINISHED") {
            evaluated = true;
            const actualHomeScore = match.score.fullTime.home || 0;
            const actualAwayScore = match.score.fullTime.away || 0;

            if (
              prediction.homeScore === actualHomeScore &&
              prediction.awayScore === actualAwayScore
            ) {
              prediction.status = "CORRECT";
              prediction.result = "Exact score prediction!";
            } else if (
              (prediction.homeScore > prediction.awayScore &&
                actualHomeScore > actualAwayScore) ||
              (prediction.homeScore < prediction.awayScore &&
                actualHomeScore < actualAwayScore) ||
              (prediction.homeScore === prediction.awayScore &&
                actualHomeScore === actualAwayScore)
            ) {
              prediction.status = "PARTIAL";
              prediction.result = "Correct outcome prediction";
            } else {
              prediction.status = "INCORRECT";
              prediction.result = "Incorrect prediction";
            }

            prediction.actualHomeScore = actualHomeScore;
            prediction.actualAwayScore = actualAwayScore;
          }
        } catch (err) {
          console.error("Error evaluating prediction:", err);
        }
      }
    }

    if (evaluated) {
      alert("Predictions evaluated! Check your history to see results.");
    } else {
      alert(
        "No pending predictions to evaluate or matches aren't finished yet."
      );
    }

    setPredictionHistory(updatedHistory);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const formatPredictionDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-[#1a1f2c] min-h-screen p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Dice5 className="text-blue-500 w-6 h-6" />
            <h2 className="text-2xl font-bold text-white">Match Predictor</h2>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600/90 p-4 rounded-md flex items-center mb-6">
            <AlertCircle className="h-5 w-5 mr-2 text-white" />
            <span className="text-white font-medium">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400" />
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {/* Upcoming Matches */}
            <div className="md:col-span-2">
              <div className="bg-[#242937] rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">
                    Upcoming Matches
                  </h3>
                  <div className="flex bg-gray-700 rounded-lg overflow-hidden">
                    {["all", "today", "tomorrow"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => filterMatches(filter)}
                        className={`px-3 py-1 text-sm capitalize ${
                          activeFilter === filter
                            ? "bg-blue-500 text-white"
                            : "text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {filteredMatches.length === 0 ? (
                    <p className="text-gray-400 text-center py-6">
                      No matches found for this filter.
                    </p>
                  ) : (
                    filteredMatches.map((match) => (
                      <div
                        key={match.id}
                        onClick={() => setSelectedMatch(match)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedMatch?.id === match.id
                            ? "bg-blue-500 text-white"
                            : "bg-[#2d3546] hover:bg-[#3a4359] text-gray-300"
                        }`}
                      >
                        <div className="text-sm mb-2">
                          {formatDate(match.utcDate)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {match.homeTeam.name}
                          </span>
                          <span className="mx-2 text-gray-400">vs</span>
                          <span className="font-medium">
                            {match.awayTeam.name}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Prediction Form and History */}
            <div className="bg-[#242937] rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  {showHistory
                    ? "Prediction History"
                    : selectedMatch
                    ? "Make a Prediction"
                    : "Select a Match"}
                </h3>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-blue-400 hover:text-blue-300 text-sm bg-[#1a1f2c] px-3 py-1 rounded-md"
                >
                  {showHistory ? "Back to Predictor" : "View History"}
                </button>
              </div>

              {showHistory ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {predictionHistory.length === 0 ? (
                    <p className="text-gray-400 text-center py-12">
                      No prediction history available.
                    </p>
                  ) : (
                    <>
                      <button
                        onClick={evaluatePredictions}
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors mb-4"
                      >
                        Check Results
                      </button>
                      {predictionHistory.map((prediction, index) => (
                        <div
                          key={index}
                          className="p-4 bg-[#2d3546] rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-white font-medium">
                              {prediction.homeTeam} vs {prediction.awayTeam}
                            </p>
                            <span className="text-xs text-gray-400">
                              {formatPredictionDate(
                                prediction.predictionDate || new Date()
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between mb-2">
                            <p className="text-gray-300 text-sm">
                              Your prediction:{" "}
                              <span className="font-semibold text-white">
                                {prediction.homeScore} - {prediction.awayScore}
                              </span>
                            </p>
                            {prediction.actualHomeScore !== undefined && (
                              <p className="text-gray-300 text-sm">
                                Actual:{" "}
                                <span className="font-semibold text-white">
                                  {prediction.actualHomeScore} -{" "}
                                  {prediction.actualAwayScore}
                                </span>
                              </p>
                            )}
                          </div>

                          <p className="text-gray-400 text-sm">
                            Match: {formatDate(prediction.matchDate)}
                          </p>

                          <div className="mt-2">
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded ${
                                prediction.status === "CORRECT"
                                  ? "bg-green-500/20 text-green-400"
                                  : prediction.status === "PARTIAL"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : prediction.status === "INCORRECT"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {prediction.status}{" "}
                              {prediction.result
                                ? `• ${prediction.result}`
                                : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : selectedMatch ? (
                <div className="space-y-6">
                  {/* Match Info */}
                  <div className="text-center p-4 bg-[#2d3546] rounded-lg">
                    <p className="text-white font-semibold text-lg mb-1">
                      {selectedMatch.homeTeam.name} vs{" "}
                      {selectedMatch.awayTeam.name}
                    </p>
                    <p className="text-blue-400 text-sm">
                      {formatDate(selectedMatch.utcDate)}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {selectedMatch.competition.name}
                    </p>
                  </div>

                  {/* Prediction Form */}
                  {isAuthenticated ? (
                    <div className="space-y-6 bg-[#2d3546] p-4 rounded-lg">
                      <h4 className="text-white font-medium">
                        Your Prediction
                      </h4>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <label className="block text-gray-300 text-sm font-medium mb-2 text-center">
                            {selectedMatch.homeTeam.name}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={
                              predictions[selectedMatch.id]?.homeScore ?? ""
                            }
                            onChange={(e) =>
                              handlePredictionChange(
                                selectedMatch.id,
                                "homeScore",
                                e.target.value
                              )
                            }
                            className="w-full bg-[#1a1f2c] text-white p-3 rounded-md text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="0"
                            required
                          />
                        </div>

                        <div className="text-gray-400 text-xl font-bold">
                          vs
                        </div>

                        <div className="flex-1">
                          <label className="block text-gray-300 text-sm font-medium mb-2 text-center">
                            {selectedMatch.awayTeam.name}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={
                              predictions[selectedMatch.id]?.awayScore ?? ""
                            }
                            onChange={(e) =>
                              handlePredictionChange(
                                selectedMatch.id,
                                "awayScore",
                                e.target.value
                              )
                            }
                            className="w-full bg-[#1a1f2c] text-white p-3 rounded-md text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="0"
                            required
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="text-red-400 text-sm text-center">
                          {error}
                        </div>
                      )}

                      <button
                        onClick={() => handlePredictionSubmit(selectedMatch.id)}
                        disabled={
                          (!predictions[selectedMatch.id]?.homeScore &&
                            predictions[selectedMatch.id]?.homeScore !== 0) ||
                          (!predictions[selectedMatch.id]?.awayScore &&
                            predictions[selectedMatch.id]?.awayScore !== 0)
                        }
                        className={`w-full py-3 rounded-md text-white font-semibold transition-all ${
                          (!predictions[selectedMatch.id]?.homeScore &&
                            predictions[selectedMatch.id]?.homeScore !== 0) ||
                          (!predictions[selectedMatch.id]?.awayScore &&
                            predictions[selectedMatch.id]?.awayScore !== 0)
                            ? "bg-gray-500 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        Submit Prediction
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4 bg-[#2d3546] p-6 rounded-lg">
                      <p className="text-gray-300">
                        Please sign in to make a prediction.
                      </p>
                      <button
                        onClick={() => navigate("/login")}
                        className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-all"
                      >
                        Sign In
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Dice5 className="text-blue-500/40 w-12 h-12 mb-4" />
                  <p className="text-gray-400">
                    Select a match from the list to make your prediction.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchPredictor;
