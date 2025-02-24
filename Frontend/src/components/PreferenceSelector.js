import React, { useState } from "react";
import axios from "axios";

const PreferenceSelector = ({ user }) => {
  const [favoriteClub, setFavoriteClub] = useState("");
  const [favoritePlayers, setFavoritePlayers] = useState([]);
  const [playerInput, setPlayerInput] = useState("");

  const handleAddPlayer = () => {
    if (playerInput && !favoritePlayers.includes(playerInput)) {
      setFavoritePlayers([...favoritePlayers, playerInput]);
      setPlayerInput("");
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        "/api/preferences/favorites",
        { club: favoriteClub, players: favoritePlayers },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Preferences saved successfully!");
    } catch (err) {
      console.error("Failed to save preferences:", err);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        Set Your Preferences
      </h2>

      <div className="space-y-4">
        <div>
          <label className="text-white block mb-2">Favorite Team</label>
          <input
            type="text"
            value={favoriteClub}
            onChange={(e) => setFavoriteClub(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="text-white block mb-2">Favorite Players</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              className="flex-1 p-2 rounded bg-gray-700 text-white"
            />
            <button
              onClick={handleAddPlayer}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>
          <ul className="mt-2 text-white">
            {favoritePlayers.map((player, index) => (
              <li key={index}>{player}</li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default PreferenceSelector;
