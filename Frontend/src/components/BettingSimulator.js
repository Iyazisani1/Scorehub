import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { getMatches, LEAGUE_DATA } from "../config/apiConfig";
import axios from "axios";

const INITIAL_COINS = 1000;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function BettingSimulator() {
  const [coins, setCoins] = useState(INITIAL_COINS);
  const [matches, setMatches] = useState([]);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [betHistory, setBetHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication status and load user data
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          setIsAuthenticated(true);
          await fetchUserData(token);
        } catch (err) {
          console.error("Authentication error:", err);
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, []);

  // Fetch user data including betting history from backend
  const fetchUserData = async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Get user profile data from backend
      const userResponse = await axios.get(`${API_URL}/users/profile`, config);
      setUser(userResponse.data);

      // Fetch betting history - assuming you add this endpoint to your backend
      const historyResponse = await axios.get(
        `${API_URL}/users/betting-history`,
        config
      );
      if (historyResponse.data && historyResponse.data.length > 0) {
        setBetHistory(historyResponse.data);
      }

      // Set user's coin balance if available from backend
      if (userResponse.data.coins) {
        setCoins(userResponse.data.coins);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data. Please try again.");
    }
  };

  useEffect(() => {
    fetchUpcomingMatches();
  }, []);

  useEffect(() => {
    if (matches.length > 0) {
      filterMatches(activeFilter);
    }
  }, [matches, activeFilter]);

  const fetchUpcomingMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const tenDaysLater = new Date();
      tenDaysLater.setDate(today.getDate() + 10);

      const requestParams = {
        dateFrom: today.toISOString().split("T")[0],
        dateTo: tenDaysLater.toISOString().split("T")[0],
        competitions: Object.values(LEAGUE_DATA).map((league) => league.id),
        status: ["SCHEDULED", "TIMED", "POSTPONED"],
        limit: 10,
      };

      const fetchedMatches = await getMatches(requestParams);
      const filteredMatches = fetchedMatches.filter((match) => {
        const matchDate = new Date(match.utcDate);
        return matchDate >= today && matchDate <= tenDaysLater;
      });

      if (!filteredMatches.length) {
        setMatches([]);
      } else {
        // Ensure each match has valid odds
        const matchesWithOdds = filteredMatches.map((match) => {
          if (
            !match.odds ||
            isNaN(match.odds.HOME) ||
            isNaN(match.odds.AWAY) ||
            isNaN(match.odds.DRAW)
          ) {
            match.odds = generateOdds(match);
          }
          return match;
        });

        setMatches(matchesWithOdds);
        setFilteredMatches(matchesWithOdds);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  // Fixed to ensure no NaN values
  const generateOdds = (match) => {
    return {
      HOME: parseFloat((Math.random() * 3 + 1.1).toFixed(2)),
      DRAW: parseFloat((Math.random() * 2 + 2.8).toFixed(2)),
      AWAY: parseFloat((Math.random() * 3 + 1.1).toFixed(2)),
    };
  };

  const filterMatches = (filter) => {
    setActiveFilter(filter);
    if (filter === "all") {
      setFilteredMatches(matches);
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayString = today.toISOString().split("T")[0];
    const tomorrowString = tomorrow.toISOString().split("T")[0];

    const filtered = matches.filter((match) => {
      const matchDate = new Date(match.utcDate).toISOString().split("T")[0];
      return filter === "today"
        ? matchDate === todayString
        : matchDate === tomorrowString;
    });

    setFilteredMatches(filtered);
  };

  const placeBet = async (match, outcomeType, amount) => {
    if (!isAuthenticated) {
      alert("Please sign in or register to place a bet.");
      return;
    }

    if (!amount || amount <= 0 || amount > coins) {
      alert("Invalid bet amount!");
      return;
    }

    // Ensure match has odds
    if (!match.odds || isNaN(match.odds[outcomeType])) {
      match.odds = generateOdds(match);
    }

    const newBet = {
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      outcome: outcomeType,
      amount: parseInt(amount),
      odds: match.odds[outcomeType],
      potential: Math.round(amount * match.odds[outcomeType]),
      status: "PENDING",
      matchDate: match.utcDate,
    };

    try {
      // Send bet to backend
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.post(`${API_URL}/users/place-bet`, newBet, config);

      // Update local state
      setBets([...bets, newBet]);
      setBetHistory([newBet, ...betHistory]);
      setCoins(coins - amount);

      alert("Bet placed successfully!");
    } catch (err) {
      console.error("Error placing bet:", err);
      alert("Failed to place bet. Please try again.");
    }
  };

  const resolveBets = async () => {
    if (!isAuthenticated) {
      setError("Please sign in to resolve bets.");
      return;
    }

    if (betHistory.filter((bet) => bet.status === "PENDING").length === 0) {
      setError("No pending bets to resolve!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Call backend to resolve bets
      const response = await axios.post(
        `${API_URL}/users/resolve-bets`,
        {},
        config
      );

      if (response.data) {
        setCoins(response.data.newBalance);
        setBetHistory(response.data.updatedBets);
        setBets([]);
        alert("Bets resolved! Check your history for results.");
      }
    } catch (err) {
      console.error("Error resolving bets:", err);
      setError("Failed to resolve bets. Please try again.");
    }
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

  return (
    <div className="bg-[#1a1f2c] min-h-screen p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <DollarSign className="text-green-500 w-6 h-6" />
            <h1 className="text-2xl font-bold text-white">
              Football Betting Simulator
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#242937] px-4 py-2 rounded-lg flex items-center">
              <DollarSign className="text-yellow-400 w-5 h-5 mr-1" />
              <span className="text-white font-semibold">{coins} Coins</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-600/90 p-4 rounded-md flex items-center mb-6">
            <AlertCircle className="h-5 w-5 mr-2 text-white" />
            <span className="text-white font-medium">{error}</span>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-blue-600/90 p-4 rounded-md flex items-center mb-6">
            <AlertCircle className="h-5 w-5 mr-2 text-white" />
            <span className="text-white font-medium">
              Please sign in or register to place bets and save your progress.
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
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
          <div className="flex gap-3">
            {isAuthenticated &&
              betHistory.filter((bet) => bet.status === "PENDING").length >
                0 && (
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors"
                  onClick={resolveBets}
                >
                  <Trophy className="w-4 h-4" />
                  Resolve Bets
                </button>
              )}
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setShowHistory(!showHistory);
                } else {
                  alert("Please sign in to view betting history.");
                }
              }}
              className={`${
                isAuthenticated
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-600 cursor-not-allowed"
              } text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors`}
            >
              {showHistory ? "Back to Betting" : "Betting History"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400" />
          </div>
        ) : showHistory && isAuthenticated ? (
          <div className="bg-[#242937] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Betting History
            </h2>
            {betHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-6">
                No betting history available.
              </p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {betHistory.map((bet) => (
                  <div
                    key={bet.id || bet._id}
                    className="p-4 bg-[#2d3546] rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">
                        {bet.homeTeam} vs {bet.awayTeam}
                      </span>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          bet.status === "WON"
                            ? "bg-green-500/20 text-green-400"
                            : bet.status === "LOST"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {bet.status}
                      </span>
                    </div>

                    <div className="mb-2 text-sm">
                      <span className="text-gray-400">Match date: </span>
                      <span className="text-gray-300">
                        {formatDate(bet.matchDate)}
                      </span>
                    </div>

                    <div className="flex justify-between mb-1">
                      <div>
                        <span className="text-gray-400 text-sm">
                          Your bet:{" "}
                        </span>
                        <span className="text-white">
                          {bet.outcome === "HOME"
                            ? bet.homeTeam
                            : bet.outcome === "AWAY"
                            ? bet.awayTeam
                            : "Draw"}
                        </span>
                      </div>

                      {bet.status !== "PENDING" && (
                        <div>
                          <span className="text-gray-400 text-sm">
                            Result:{" "}
                          </span>
                          <span className="text-white">
                            {bet.actualOutcome === "HOME"
                              ? bet.homeTeam
                              : bet.actualOutcome === "AWAY"
                              ? bet.awayTeam
                              : "Draw"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-700">
                      <div>
                        <span className="text-gray-400 text-sm">
                          Bet amount:{" "}
                        </span>
                        <span className="text-yellow-400 font-semibold">
                          {bet.amount} coins
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">
                          {bet.status === "WON" ? "Won" : "Potential"} payout:
                        </span>
                        <span className="text-green-400 font-semibold ml-1">
                          {bet.potential} coins
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400">
                  No matches found for this filter.
                </p>
              </div>
            ) : (
              filteredMatches.map((match) => {
                // Ensure match has valid odds
                if (
                  !match.odds ||
                  isNaN(match.odds.HOME) ||
                  isNaN(match.odds.AWAY) ||
                  isNaN(match.odds.DRAW)
                ) {
                  match.odds = generateOdds(match);
                }

                return (
                  <div
                    key={match.id}
                    className="bg-[#242937] rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-700">
                      <div className="text-sm text-gray-400 mb-2">
                        {formatDate(match.utcDate)}
                      </div>
                      <div className="text-center mb-3">
                        <p className="text-gray-300 text-sm">
                          {match.competition.name}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-white font-medium text-center flex-1">
                          {match.homeTeam.name}
                        </div>
                        <div className="mx-3 text-gray-400">vs</div>
                        <div className="text-white font-medium text-center flex-1">
                          {match.awayTeam.name}
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-4">
                        <p className="text-white text-sm mb-2">Betting Odds:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            className={`${
                              isAuthenticated
                                ? "bg-[#2d3546] hover:bg-blue-500/20"
                                : "bg-[#2d3546] opacity-70 cursor-not-allowed"
                            } p-2 rounded text-center transition-colors`}
                            onClick={() => {
                              if (isAuthenticated) {
                                const amount = prompt(
                                  `Enter bet amount for ${match.homeTeam.name} to win:`
                                );
                                if (amount)
                                  placeBet(match, "HOME", parseInt(amount));
                              } else {
                                alert(
                                  "Please sign in or register to place bets."
                                );
                              }
                            }}
                          >
                            <div className="text-white font-medium">
                              {match.homeTeam.shortName || match.homeTeam.name}
                            </div>
                            <div className="text-green-400 font-bold">
                              {match.odds.HOME.toFixed(2)}
                            </div>
                          </button>
                          <button
                            className={`${
                              isAuthenticated
                                ? "bg-[#2d3546] hover:bg-blue-500/20"
                                : "bg-[#2d3546] opacity-70 cursor-not-allowed"
                            } p-2 rounded text-center transition-colors`}
                            onClick={() => {
                              if (isAuthenticated) {
                                const amount = prompt(
                                  `Enter bet amount for ${match.awayTeam.name} to win:`
                                );
                                if (amount)
                                  placeBet(match, "AWAY", parseInt(amount));
                              } else {
                                alert(
                                  "Please sign in or register to place bets."
                                );
                              }
                            }}
                          >
                            <div className="text-white font-medium">
                              {match.awayTeam.shortName || match.awayTeam.name}
                            </div>
                            <div className="text-green-400 font-bold">
                              {match.odds.AWAY.toFixed(2)}
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
