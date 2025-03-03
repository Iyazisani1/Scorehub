import React, { useState, useEffect } from "react";
import { getUserPreferences, updateUserPreferences } from "../services/api";

const PreferenceSelector = ({ user }) => {
  const [favoriteClub, setFavoriteClub] = useState("");
  const [favoritePlayers, setFavoritePlayers] = useState([]);
  const [playerInput, setPlayerInput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !user.token) {
      setError("User not authenticated");
      return;
    }

    const fetchPreferences = async () => {
      try {
        const response = await getUserPreferences(user.token);
        setFavoriteClub(response.data.favoriteClub);
        setFavoritePlayers(response.data.favoritePlayers);
      } catch (err) {
        setError("Failed to fetch user preferences");
      }
    };

    fetchPreferences();
  }, [user]);

  const handleAddPlayer = () => {
    if (playerInput.trim() === "") return;
    setFavoritePlayers([...favoritePlayers, playerInput]);
    setPlayerInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserPreferences(user.token, {
        favoriteClub,
        favoritePlayers,
      });
      setMessage("Preferences updated successfully");
      setError("");
    } catch (err) {
      setError("Failed to update preferences");
      setMessage("");
    }
  };

  return (
    <div className="bg-[#1a1f2c] min-h-screen flex items-center justify-center text-white">
      <div className="bg-[#242937] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          User Preferences
        </h2>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="favoriteClub" className="block mb-2">
              Favorite Club
            </label>
            <input
              type="text"
              id="favoriteClub"
              placeholder="Enter your favorite club"
              value={favoriteClub}
              onChange={(e) => setFavoriteClub(e.target.value)}
              className="w-full p-2 bg-[#1a1f2c] border border-gray-600 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="favoritePlayers" className="block mb-2">
              Favorite Players
            </label>
            <div className="flex mb-2">
              <input
                type="text"
                id="favoritePlayers"
                placeholder="Add a player"
                value={playerInput}
                onChange={(e) => setPlayerInput(e.target.value)}
                className="w-full p-2 bg-[#1a1f2c] border border-gray-600 rounded-l"
              />
              <button
                type="button"
                onClick={handleAddPlayer}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r"
              >
                Add
              </button>
            </div>
            <ul className="list-disc pl-5">
              {favoritePlayers.map((player, index) => (
                <li key={index} className="text-gray-300">
                  {player}
                </li>
              ))}
            </ul>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
          >
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
};

export default PreferenceSelector;
