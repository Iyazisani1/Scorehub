import React, { useState, useEffect } from "react";
import { Trophy, DollarSign, AlertCircle } from "lucide-react";
import { getMatches, LEAGUE_DATA } from "../config/apiConfig";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const INITIAL_COINS = 1000;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4001/api";
console.log("Using API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [balance, setBalance] = useState(null);
  const [bettingHistory, setBettingHistory] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/user/profile");
        if (response.data) {
          setIsAuthenticated(true);
          setUser(response.data);
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) return;

      try {
        const [balanceRes, historyRes] = await Promise.all([
          api.get("/betting/balance"),
          api.get("/betting/history"),
        ]);

        setBalance(balanceRes.data.balance);
        setBettingHistory(historyRes.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data");
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

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

      const calculateOdds = (match) => {
        const baseHomeWin = 2.0;
        const baseDraw = 3.0;
        const baseAwayWin = 2.0;

        const homeFactor = 0.8 + Math.random() * 0.4;
        const awayFactor = 0.8 + Math.random() * 0.4;
        const drawFactor = 0.9 + Math.random() * 0.2;

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

  const placeBet = async (matchId, selectedOutcome, betAmount, odds) => {
    try {
      const amount = parseFloat(betAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid bet amount");
        return;
      }

      if (amount > balance) {
        toast.error("Insufficient balance");
        return;
      }

      const match = matches.find((m) => m.id === matchId);
      if (!match) {
        throw new Error("Match not found");
      }

      const selectedTeam =
        selectedOutcome === "HOME"
          ? match.homeTeam.name
          : selectedOutcome === "AWAY"
          ? match.awayTeam.name
          : "Draw";

      const response = await api.post("/betting/place", {
        matchId,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        competition: match.competition.name,
        betAmount: amount,
        odds,
        selectedOutcome,
        selectedTeam,
        matchDate: match.utcDate,
      });

      setBalance(response.data.newBalance);
      setBettingHistory((prev) => [response.data.bet, ...prev]);

      toast.success("Bet placed successfully!");
    } catch (error) {
      console.error("Error placing bet:", error);
      toast.error(error.response?.data?.message || "Failed to place bet");
    }
  };

  const resolveBets = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to resolve bets.");
      return;
    }

    const pendingBets = bettingHistory.filter(
      (bet) => bet.status === "PENDING"
    );
    if (pendingBets.length === 0) {
      toast.error("No pending bets to resolve!");
      return;
    }

    try {
      const response = await api.post("/betting/resolve", {
        username: user.username,
      });

      // Update local state with new balance and resolved bets
      if (response.data.newBalance !== undefined) {
        setBalance(response.data.newBalance);
      }

      // Update betting history with resolved bets
      const updatedHistory = bettingHistory.map((bet) => {
        if (bet.status === "PENDING") {
          const resolvedBet = response.data.resolvedBets?.find(
            (r) => r._id === bet._id
          );
          if (resolvedBet) {
            return resolvedBet;
          }
        }
        return bet;
      });

      setBettingHistory(updatedHistory);
      toast.success("Bets resolved successfully!");
    } catch (error) {
      console.error("Error resolving bets:", error);
      toast.error(error.response?.data?.message || "Failed to resolve bets");
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
    setBalance(null);
    setBettingHistory([]);
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
                <span className="text-white font-semibold">
                  {balance} Coins
                </span>
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
              bettingHistory.filter((bet) => bet.status === "PENDING").length >
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
            {bettingHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-6">
                No betting history available.
              </p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {bettingHistory.map((bet) => (
                  <div key={bet._id} className="p-4 bg-[#2d3546] rounded-lg">
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
                        <span className="text-white ml-1">
                          {bet.selectedTeam ||
                            (bet.outcome === "DRAW"
                              ? "Draw"
                              : bet.outcome === "HOME"
                              ? bet.homeTeam
                              : bet.awayTeam)}
                        </span>
                      </div>

                      {bet.status !== "PENDING" && (
                        <div>
                          <span className="text-gray-400 text-sm">
                            Result:{" "}
                          </span>
                          <span className="text-white ml-1">
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
                          {bet.betAmount} coins
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">
                          {bet.status === "PENDING"
                            ? "Potential"
                            : bet.status === "WON"
                            ? "Won"
                            : "Lost"}{" "}
                          payout:{" "}
                        </span>
                        <span
                          className={`font-semibold ml-1 ${
                            bet.status === "WON"
                              ? "text-green-400"
                              : "text-gray-400"
                          }`}
                        >
                          {bet.status === "PENDING"
                            ? (bet.betAmount * bet.odds).toFixed(2)
                            : bet.status === "WON"
                            ? bet.winnings
                            : 0}{" "}
                          coins
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
                        <div className="grid grid-cols-3 gap-2">
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
                                  placeBet(match.id, "HOME", amount, odds.HOME);
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
                                  `Enter bet amount for Draw:`
                                );
                                if (amount)
                                  placeBet(match.id, "DRAW", amount, odds.DRAW);
                              } else {
                                toast.error(
                                  "Please sign in or register to place bets."
                                );
                              }
                            }}
                            disabled={!isAuthenticated}
                          >
                            <div className="text-white font-medium">Draw</div>
                            <div className="text-green-400 font-bold">
                              {odds.DRAW.toFixed(2)}
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
                                  placeBet(match.id, "AWAY", amount, odds.AWAY);
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
