import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Newspaper, Star, Info, Dice5, User } from "lucide-react";

export default function Navbar({
  isAuthenticated,
  setIsAuthenticated,
  username,
  setUsername,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [setUsername]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setUsername("");
    navigate("/");
  };

  return (
    <div className="bg-[#1a1f2c] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl font-bold text-blue-500">SCOREHUB</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/transfers"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Newspaper className="mr-2 h-5 w-5" />
              Transfers
            </Link>

            <Link
              to="/betting"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Star className="mr-2 h-5 w-5" />
              Betting
            </Link>
            <Link
              to="/predictor"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Dice5 className="mr-2 h-5 w-5" />
              Match Predictor
            </Link>

            {isAuthenticated && (
              <Link
                to="/preferences"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <User className="mr-2 h-5 w-5" />
                Preferences
              </Link>
            )}

            <Link
              to="/about"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Info className="mr-2 h-5 w-5" />
              About Us
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">
              Hello {isAuthenticated && username ? username : "Guest"}!
            </span>
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => navigate("/signin")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
