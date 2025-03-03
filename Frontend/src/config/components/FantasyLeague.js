import React, { useState, useEffect } from "react";
import { Trophy, Star, TrendingUp } from "lucide-react";
import axios from "axios";

export default function FantasyLeague({ leagueId }) {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!leagueId) {
        setError("Invalid league selected");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `/api/football-data/competitions/${leagueId}/teams`
        );

        if (response.status === 404) {
          throw new Error("Players not found for the selected league");
        }
        setAvailablePlayers(response.data.players || []);
        // Fetch leaderboard data
        const leaderboardResponse = await axios.get(
          `http://localhost:4001/api/football/fantasy/leaderboard`
        );
        setLeaderboard(leaderboardResponse.data || []);
        // Fetch user's points
        const userPointsResponse = await axios.get(
          `http://localhost:4001/api/football/fantasy/points`
        );
        setUserPoints(userPointsResponse.data.points || 0);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch fantasy league data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (leagueId) {
      fetchPlayers();
    }
  }, [leagueId]);

  const handlePlayerSelection = (player) => {
    if (selectedPlayers.length < 11 && !selectedPlayers.includes(player)) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const removePlayer = (playerToRemove) => {
    setSelectedPlayers(
      selectedPlayers.filter((player) => player.id !== playerToRemove.id)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Fantasy League</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fantasy Team Section */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Star className="mr-2 text-yellow-500" /> Your Fantasy Team
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {selectedPlayers.map((player) => (
              <div
                key={player.id}
                className="bg-white rounded-lg p-3 border border-gray-200 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => removePlayer(player)}
              >
                <span className="font-medium">{player.name}</span>
                <span className="text-sm text-gray-600">{player.position}</span>
              </div>
            ))}
            {Array(11 - selectedPlayers.length)
              .fill(0)
              .map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="bg-gray-50 rounded-lg p-3 border border-dashed border-gray-300 text-center text-gray-400"
                >
                  Empty Slot
                </div>
              ))}
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Available Players</h3>
            <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200">
              {availablePlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => handlePlayerSelection(player)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{player.name}</span>
                    <span className="text-sm text-gray-600">
                      {player.position}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{player.team}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Trophy className="mr-2 text-yellow-500" /> Leaderboard
          </h2>
          <div className="space-y-2">
            {leaderboard.map((user, index) => (
              <div
                key={user.id}
                className={`rounded-lg p-3 border ${
                  index === 0
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span
                      className={`font-bold mr-2 ${
                        index === 0 ? "text-yellow-500" : "text-gray-600"
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <span className="font-semibold">{user.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-white rounded-lg p-4 shadow md:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-blue-500" /> Your Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userPoints}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {leaderboard.findIndex((user) => user.id === "currentUser") + 1}
              </div>
              <div className="text-sm text-gray-600">Current Rank</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {selectedPlayers.length}
              </div>
              <div className="text-sm text-gray-600">Selected Players</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {11 - selectedPlayers.length}
              </div>
              <div className="text-sm text-gray-600">Remaining Slots</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
