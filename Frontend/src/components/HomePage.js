import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { getMatches, LEAGUE_DATA } from "../config/apiConfig";
import { useNavigate } from "react-router-dom";
import { MatchCard } from "./MatchCard";

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("default");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const formattedDate = format(selectedDate, "yyyy-MM-dd");

        const matchData = await getMatches({
          dateFrom: formattedDate,
          dateTo: formattedDate,
          competitions: Object.keys(LEAGUE_DATA),
          status: ["SCHEDULED", "LIVE", "IN_PLAY", "PAUSED", "FINISHED"],
        });

        setMatches(matchData);
      } catch (err) {
        setError(err.message || "Failed to fetch matches");
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [selectedDate]);

  const priorityLeagues = {
    "Premier League": 1,
    "UEFA Champions League": 2,
    "La Liga": 3,
  };

  const getSortedMatches = () => {
    let sortedMatches = [...matches];

    switch (filter) {
      case "time":
        return sortedMatches.sort(
          (a, b) => new Date(a.utcDate) - new Date(b.utcDate)
        );
      case "competition":
        return sortedMatches.sort((a, b) =>
          a.competition.name.localeCompare(b.competition.name)
        );
      case "default":
      default:
        return sortedMatches.sort((a, b) => {
          const aPriority = priorityLeagues[a.competition.name] || 999;
          const bPriority = priorityLeagues[b.competition.name] || 999;

          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          return new Date(a.utcDate) - new Date(b.utcDate);
        });
    }
  };

  const groupedMatches = getSortedMatches().reduce((groups, match) => {
    const competition = match.competition.name;
    if (!groups[competition]) {
      groups[competition] = [];
    }
    groups[competition].push(match);
    return groups;
  }, {});

  const handleMatchClick = (matchId) => {
    navigate(`/match/${matchId}`);
  };

  return (
    <div className="bg-gradient-to-b from-[#1a1f2c] to-[#2d3448] min-h-screen p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#2d3448] p-4 rounded-lg shadow-lg mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedDate((prev) => subDays(prev, 1))}
              className="p-2 hover:bg-gray-600 rounded-full transition-colors text-gray-200"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              <span className="font-medium text-lg text-white">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </span>
            </div>
            <button
              onClick={() => setSelectedDate((prev) => addDays(prev, 1))}
              className="p-2 hover:bg-gray-600 rounded-full transition-colors text-gray-200"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <Filter className="h-5 w-5 text-gray-300" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#1a1f2c] text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            >
              <option value="default">Priority Leagues</option>
              <option value="time">Sort by Time</option>
              <option value="competition">Sort by Competition</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-600/90 p-4 rounded-md flex items-center mb-4 shadow-md">
            <AlertCircle className="h-5 w-5 mr-2 text-white" />
            <span className="text-white font-medium">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 bg-[#2d3448] rounded-lg border border-gray-700 shadow-md">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-400 text-lg">
              No matches scheduled for this date
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMatches).map(
              ([competition, competitionMatches]) => (
                <div
                  key={competition}
                  className="bg-[#2d3448] rounded-lg shadow-md border border-gray-700"
                >
                  <div className="bg-[#3a4359] p-4 rounded-t-lg flex items-center">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      {competitionMatches[0].competition.emblem && (
                        <img
                          src={competitionMatches[0].competition.emblem}
                          alt={`${competition} logo`}
                          className="w-8 h-8 mr-3 object-contain bg-white p-1 rounded-full" // Added bg-white and padding for contrast
                          onError={(e) => {
                            e.target.style.display = "none";
                          }} // Fallback if image fails
                        />
                      )}
                      {competition}
                    </h2>
                  </div>
                  <div className="p-4 space-y-4">
                    {competitionMatches.map((match) => (
                      <div
                        key={match.id}
                        onClick={() => handleMatchClick(match.id)}
                        className="cursor-pointer bg-[#1a1f2c] p-4 rounded-lg hover:bg-[#242937] transition-colors shadow-sm border border-gray-600"
                      >
                        <MatchCard match={match} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
