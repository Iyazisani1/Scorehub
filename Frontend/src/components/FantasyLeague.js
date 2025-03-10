import React, { useState } from "react";
import { Trophy, Star, TrendingUp } from "lucide-react";
import { useUserPoints } from "./Points";

// Mock player data (you'd typically fetch this from an API or database)
const PLAYERS = [
  {
    id: 1,
    name: "Harry Kane",
    position: "Forward",
    team: "Tottenham",
    basePoints: 5,
  },
  {
    id: 2,
    name: "Kevin De Bruyne",
    position: "Midfielder",
    team: "Manchester City",
    basePoints: 6,
  },
  {
    id: 3,
    name: "Virgil van Dijk",
    position: "Defender",
    team: "Liverpool",
    basePoints: 4,
  },
  {
    id: 4,
    name: "Alisson Becker",
    position: "Goalkeeper",
    team: "Liverpool",
    basePoints: 4,
  },
  {
    id: 5,
    name: "Bruno Fernandes",
    position: "Midfielder",
    team: "Manchester United",
    basePoints: 5,
  },
  // Add more players
];

export default function FantasyLeague({ isAuthenticated }) {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const { userPoints, addPoints } = useUserPoints();
  const [teamName, setTeamName] = useState("");

  // Simulate weekly points calculation
  const calculateTeamPoints = () => {
    return selectedPlayers.reduce(
      (total, player) => total + player.basePoints,
      0
    );
  };

  const handlePlayerSelection = (player) => {
    // Check authentication
    if (!isAuthenticated) {
      // Redirect to sign-in page or show modal
      return;
    }

    // Limit team to 11 players
    if (selectedPlayers.length < 11 && !selectedPlayers.includes(player)) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const removePlayer = (playerToRemove) => {
    setSelectedPlayers(
      selectedPlayers.filter((player) => player.id !== playerToRemove.id)
    );
  };

  const submitTeam = () => {
    if (selectedPlayers.length !== 11) {
      alert("Please select exactly 11 players");
      return;
    }

    if (!teamName.trim()) {
      alert("Please enter a team name");
      return;
    }

    // Calculate and award points
    const weeklyPoints = calculateTeamPoints();
    addPoints(weeklyPoints);

    // You might want to save the team to a backend or local storage
    alert(`Team submitted! Earned ${weeklyPoints} points this week.`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Fantasy League</h1>

      {/* Team Name Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

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

          {/* Player Selection */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Available Players</h3>
            <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200">
              {PLAYERS.filter(
                (player) =>
                  !selectedPlayers.some((selected) => selected.id === player.id)
              ).map((player) => (
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

          {/* Submit Team Button */}
          <button
            onClick={submitTeam}
            className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Submit Team
          </button>
        </div>

        {/* Leaderboard Section */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Trophy className="mr-2 text-yellow-500" /> Leaderboard
          </h2>
          <div className="space-y-2">
            {/* Mock Leaderboard - you'd typically fetch this from a backend */}
            {[
              { id: 1, name: "Top Scorer", points: 120 },
              { id: 2, name: "Fantasy Master", points: 110 },
              { id: 3, name: "Goal Getter", points: 105 },
            ].map((user, index) => (
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
                {calculateTeamPoints()}
              </div>
              <div className="text-sm text-gray-600">Team Points</div>
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
