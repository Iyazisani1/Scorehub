import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { getMatches, LEAGUE_DATA } from "../config/apiConfig";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const INITIAL_COINS = 1000;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4001/api";
console.log("Using API URL:", API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export default function BettingSimulator() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState(INITIAL_COINS);
  const [matches, setMatches] = useState([]);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [betHistory, setBetHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/user/profile");
        if (response.data) {
          setIsAuthenticated(true);
          setUser(response.data);
          if (response.data.coins !== undefined) {
            setCoins(response.data.coins);
          }
          fetchBettingHistory();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      checkAuth();
    } else {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "username") {
        window.location.reload();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fetchBettingHistory = async () => {
    try {
      const response = await api.get("/dashboard/history");
      if (response.data) {
        setBetHistory(response.data);
      }
    } catch (error) {
      console.warn("Could not fetch betting history:", error);
    }
  };

  useEffect(() => {
    fetchUpcomingMatches();
  }, []);

  useEffect(() => {
    if (matches.length > 0) {
      setFilteredMatches(matches);
    }
  }, [matches]);

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

      if (!fetchedMatches || !Array.isArray(fetchedMatches)) {
        throw new Error("Invalid matches data received");
      }

      const filteredMatches = fetchedMatches.filter((match) => {
        const matchDate = new Date(match.utcDate);
        return matchDate >= today && matchDate <= tenDaysLater;
      });

      // Function to calculate dynamic odds
      const calculateOdds = (match) => {
        // Base odds
        const baseHomeWin = 2.0;
        const baseDraw = 3.0;
        const baseAwayWin = 2.0;

        // Random factors to add variety
        const homeFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const awayFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const drawFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1

        // Competition factor (some leagues are more competitive)
        const competitionFactor =
          {
            "Premier League": 1.0,
            "La Liga": 1.0,
            Bundesliga: 1.0,
            "Serie A": 1.0,
            "Ligue 1": 1.1,
            "Champions League": 0.9,
            "Europa League": 1.0,
          }[match.competition.name] || 1.0;

        // Calculate final odds with some randomness
        const homeOdds = (baseHomeWin * homeFactor * competitionFactor).toFixed(
          2
        );
        const awayOdds = (baseAwayWin * awayFactor * competitionFactor).toFixed(
          2
        );
        const drawOdds = (baseDraw * drawFactor * competitionFactor).toFixed(2);

        return {
          HOME: parseFloat(homeOdds),
          DRAW: parseFloat(drawOdds),
          AWAY: parseFloat(awayOdds),
        };
      };

      const matchesWithOdds = filteredMatches.map((match) => ({
        ...match,
        odds: calculateOdds(match),
      }));

      setMatches(matchesWithOdds);
      setFilteredMatches(matchesWithOdds);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err.message || "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  const placeBet = async (match, outcomeType, amount) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to place bets.");
      navigate("/signin");
      return;
    }

    if (!amount || amount <= 0 || amount > coins) {
      toast.error("Invalid bet amount!");
      return;
    }

    try {
      // Create bet object locally
      const newBet = {
        id: Date.now(), // Generate unique ID
        matchId: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        outcome: outcomeType,
        amount: parseInt(amount),
        odds: match.odds[outcomeType],
        potential: Math.round(amount * match.odds[outcomeType]),
        status: "PENDING",
        matchDate: match.utcDate,
        competition: match.competition.name,
        username: localStorage.getItem("username"),
      };

      // Update local state
      setBets((prevBets) => [...prevBets, newBet]);
      setBetHistory((prevHistory) => [newBet, ...prevHistory]);
      setCoins((prevCoins) => prevCoins - amount);

      toast.success("Bet placed successfully!");
    } catch (err) {
      console.error("Bet placement error:", err);
      toast.error("Failed to place bet. Please try again.");
    }
  };

  const resolveBets = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to resolve bets.");
      return;
    }

    const pendingBets = betHistory.filter((bet) => bet.status === "PENDING");
    if (pendingBets.length === 0) {
      toast.error("No pending bets to resolve!");
      return;
    }

    try {
      // Resolve bets locally
      const updatedBets = pendingBets.map((bet) => {
        // Find the corresponding match
        const match = matches.find((m) => m.id === bet.matchId);
        if (!match) return bet;

        // Determine if bet was won based on match result
        let status = "LOST";
        let actualOutcome = "DRAW";

        if (match.score?.winner === "HOME_TEAM") {
          actualOutcome = "HOME";
          if (bet.outcome === "HOME") status = "WON";
        } else if (match.score?.winner === "AWAY_TEAM") {
          actualOutcome = "AWAY";
          if (bet.outcome === "AWAY") status = "WON";
        } else if (match.score?.winner === "DRAW") {
          if (bet.outcome === "DRAW") status = "WON";
        }

        // Calculate winnings if bet was won
        let winnings = 0;
        if (status === "WON") {
          winnings = bet.potential;
        }

        return {
          ...bet,
          status,
          actualOutcome,
          winnings,
        };
      });

      // Update coins based on winnings
      const totalWinnings = updatedBets.reduce(
        (sum, bet) => sum + (bet.winnings || 0),
        0
      );
      setCoins((prevCoins) => prevCoins + totalWinnings);

      // Update bet history
      setBetHistory((prevHistory) =>
        prevHistory.map((bet) => {
          const updatedBet = updatedBets.find((b) => b.id === bet.id);
          return updatedBet || bet;
        })
      );

      // Clear current bets
      setBets([]);

      toast.success("Bets resolved! Check your history for results.");
    } catch (err) {
      console.error("Error resolving bets:", err);
      toast.error("Failed to resolve bets. Please try again.");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setUser(null);
    setCoins(INITIAL_COINS);
    setBetHistory([]);
    navigate("/signin");
  };

  if (!authChecked) {
    return (
      <div className="bg-[#1a1f2c] min-h-screen p-6 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-16">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-400" />
          </div>
        </div>
      </div>
    );
  }

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
          {isAuthenticated && user && (
            <div className="flex items-center gap-4">
              <div className="bg-[#242937] px-4 py-2 rounded-lg flex items-center">
                <DollarSign className="text-yellow-400 w-5 h-5 mr-1" />
                <span className="text-white font-semibold">{coins} Coins</span>
              </div>
              <div className="text-white">
                Welcome, {user.username || "User"}!
              </div>
            </div>
          )}
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
                  toast.info("Please sign in to view betting history.");
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

        {showHistory && isAuthenticated ? (
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
                <p className="text-gray-400">No matches found.</p>
              </div>
            ) : (
              filteredMatches.map((match) => {
                const odds = match.odds || { HOME: 2.5, DRAW: 3.0, AWAY: 2.5 };
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
                                toast.error(
                                  "Please sign in or register to place bets."
                                );
                              }
                            }}
                            disabled={!isAuthenticated}
                          >
                            <div className="text-white font-medium">
                              {match.homeTeam.shortName || match.homeTeam.name}
                            </div>
                            <div className="text-green-400 font-bold">
                              {odds.HOME.toFixed(2)}
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
                                toast.error(
                                  "Please sign in or register to place bets."
                                );
                              }
                            }}
                            disabled={!isAuthenticated}
                          >
                            <div className="text-white font-medium">
                              {match.awayTeam.shortName || match.awayTeam.name}
                            </div>
                            <div className="text-green-400 font-bold">
                              {odds.AWAY.toFixed(2)}
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
