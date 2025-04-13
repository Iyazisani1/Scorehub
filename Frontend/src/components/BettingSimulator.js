import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { getMatches, LEAGUE_DATA } from "../config/apiConfig";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const INITIAL_COINS = 1000;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export default function BettingSimulator() {
  const navigate = useNavigate();
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Debug logging for auth state
  useEffect(() => {
    console.log("Auth State Debug:", {
      isAuthenticated,
      hasUser: !!user,
      isCheckingAuth,
      token: !!localStorage.getItem("token"),
      userId: !!localStorage.getItem("userId"),
    });
  }, [isAuthenticated, user, isCheckingAuth]);

  // Verify token function
  const verifyToken = async (token) => {
    if (!token) return false;
    try {
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.status === 200;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  };

  // Check authentication function
  const checkAuth = async () => {
    setIsCheckingAuth(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      console.log("Checking auth with credentials:", {
        hasToken: !!token,
        hasUserId: !!userId,
      });

      if (!token || !userId) {
        console.log("No credentials found, setting unauthenticated");
        setIsAuthenticated(false);
        setUser(null);
        setIsCheckingAuth(false);
        return;
      }

      // First verify the token is valid
      const isValid = await verifyToken(token);
      if (!isValid) {
        console.log("Token verification failed, clearing credentials");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setIsAuthenticated(false);
        setUser(null);
        toast.error("Session expired. Please login again.");
        setIsCheckingAuth(false);
        return;
      }

      // Fetch user data directly
      try {
        console.log("Fetching user profile with verified token...");
        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          console.log("User profile fetched successfully:", response.data);
          setIsAuthenticated(true);
          setUser(response.data);
          if (response.data.coins !== undefined) {
            setCoins(response.data.coins);
          }

          // Fetch betting history
          try {
            const historyResponse = await axios.get(
              `${API_URL}/dashboard/history`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (historyResponse.data) {
              setBetHistory(historyResponse.data);
            }
          } catch (historyError) {
            console.warn("Could not fetch betting history:", historyError);
            // Continue even if history fetch fails
          }
        } else {
          console.log("No user data in response");
          throw new Error("No user data received");
        }
      } catch (error) {
        console.error("Error during profile fetch:", error);
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setIsAuthenticated(false);
          setUser(null);
          toast.error("Session expired. Please login again.");
        } else {
          // For other errors, don't clear auth state
          console.error("Error fetching user data:", error);
          toast.error("Failed to load user data");
        }
      }
    } catch (err) {
      console.error("Authentication check failed:", err);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Initial auth check
  useEffect(() => {
    checkAuth();
  }, []);

  // Check auth on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (token && userId && !isAuthenticated) {
        checkAuth();
      } else if ((!token || !userId) && isAuthenticated) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUpcomingMatches();
  }, []);

  useEffect(() => {
    if (matches.length > 0) {
      filterMatches(activeFilter);
    }
  }, [matches, activeFilter]);

  // Fetch upcoming matches
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

  // Generate random odds for a match
  const generateOdds = (match) => {
    return {
      HOME: parseFloat((Math.random() * 2 + 1.5).toFixed(2)),
      DRAW: parseFloat((Math.random() * 1.5 + 2.0).toFixed(2)),
      AWAY: parseFloat((Math.random() * 2 + 1.5).toFixed(2)),
    };
  };

  // Filter matches by date
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

  // Place a bet
  const placeBet = async (match, outcomeType, amount) => {
    console.log("Attempting to place bet...", {
      isAuthenticated,
      hasUser: !!user,
    });

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      console.log("No credentials found for betting");
      toast.error("Please sign in or register to place a bet.");
      return;
    }

    if (!isAuthenticated || !user) {
      console.log("Not authenticated or no user data");
      toast.error("Please sign in or register to place a bet.");
      return;
    }

    // Verify token before placing bet
    console.log("Verifying token before bet...");
    const isValid = await verifyToken(token);
    if (!isValid) {
      console.log("Token invalid for betting");
      toast.error("Your session has expired. Please sign in again.");
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    if (!amount || amount <= 0 || amount > coins) {
      toast.error("Invalid bet amount!");
      return;
    }

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
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.post(
        `${API_URL}/user/place-bet`,
        newBet,
        config
      );

      if (response.data) {
        setBets([...bets, newBet]);
        setBetHistory([newBet, ...betHistory]);
        setCoins(coins - amount);
        toast.success("Bet placed successfully!");
      }
    } catch (err) {
      console.error("Error placing bet:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Your session has expired. Please sign in again.");
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      } else {
        toast.error("Failed to place bet. Please try again.");
      }
    }
  };

  // Resolve bets
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
        `${API_URL}/user/resolve-bets`,
        {},
        config
      );

      if (response.data) {
        setCoins(response.data.newBalance);
        setBetHistory(response.data.updatedBets);
        setBets([]);
        toast.success("Bets resolved! Check your history for results.", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (err) {
      console.error("Error resolving bets:", err);
      setError("Failed to resolve bets. Please try again.");
    }
  };

  // Format date string
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

  if (isCheckingAuth) {
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
        {/* Header */}
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
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600/90 p-4 rounded-md flex items-center mb-6">
            <AlertCircle className="h-5 w-5 mr-2 text-white" />
            <span className="text-white font-medium">{error}</span>
          </div>
        )}

        {/* Authentication Warning */}
        {(!isAuthenticated || !user) && (
          <div className="bg-blue-600/90 p-4 rounded-md flex items-center mb-6">
            <AlertCircle className="h-5 w-5 mr-2 text-white" />
            <span className="text-white font-medium">
              Please sign in or register to place bets and save your progress.
            </span>
          </div>
        )}

        {/* Filters and Controls */}
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

        {/* Content: Loading, History, or Matches */}
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
                if (!match.odds) {
                  match.odds = generateOdds(match);
                }

                return (
                  <div
                    key={match.id}
                    className="bg-[#242937] rounded-lg shadow-lg overflow-hidden"
                  >
                    {/* Match Header */}
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

                    {/* Betting Options */}
                    <div className="p-4">
                      <div className="mb-4">
                        <p className="text-white text-sm mb-2">Betting Odds:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Home Team Bet Button */}
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
                              {match.odds.HOME.toFixed(2)}
                            </div>
                          </button>

                          {/* Away Team Bet Button */}
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
