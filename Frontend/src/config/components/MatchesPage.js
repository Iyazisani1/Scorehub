import React, { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { getMatches, COMPETITION_CODES } from "../config/apiConfig";

const MatchesPage = ({ leagueId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);

      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const competitions = leagueId
          ? [COMPETITION_CODES[leagueId]]
          : Object.values(COMPETITION_CODES);

        const matchesData = await getMatches({
          dateFrom: formattedDate,
          competitions,
        });

        setMatches(matchesData || []);
      } catch (err) {
        setError(err.message || "Failed to fetch matches");
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [selectedDate, leagueId]);

  // Safe date formatter
  const formatMatchTime = (dateString) => {
    try {
      if (!dateString) return "TBD";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "TBD";
      return format(date, "HH:mm");
    } catch (error) {
      console.error("Error formatting match time:", error);
      return "TBD";
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2c] text-white p-6">
      <div className="flex items-center justify-between mb-6 bg-[#242937] p-4 rounded-lg shadow-lg">
        <button
          onClick={() => setSelectedDate((prev) => subDays(prev, 1))}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-gray-300" />
        </button>

        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          <span className="font-medium text-lg">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </span>
        </div>

        <button
          onClick={() => setSelectedDate((prev) => addDays(prev, 1))}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <ChevronRight className="h-6 w-6 text-gray-300" />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 bg-red-100 bg-opacity-10 p-4 rounded-lg">
            {error}
          </div>
        ) : matches.length > 0 ? (
          matches.map((match) => (
            <div
              key={match.id}
              className="bg-[#242937] rounded-lg p-4 shadow-lg hover:bg-[#2a303f] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {match.homeTeam?.crest && (
                    <img
                      src={match.homeTeam.crest}
                      alt=""
                      className="w-8 h-8"
                    />
                  )}
                  <span className="font-medium">
                    {match.homeTeam?.name || "Unknown Team"}
                  </span>
                </div>

                <div className="flex flex-col items-center mx-4">
                  {match.status === "FINISHED" ? (
                    <div className="text-xl font-bold">
                      {match.score?.fullTime?.home ?? "-"} -{" "}
                      {match.score?.fullTime?.away ?? "-"}
                    </div>
                  ) : (
                    <div className="text-lg font-medium text-gray-300">
                      {match.utcDate ? formatMatchTime(match.utcDate) : "TBD"}
                    </div>
                  )}
                  <div className="text-sm text-gray-400 mt-1">
                    {match.status}
                  </div>
                </div>

                <div className="flex items-center space-x-4 flex-1 justify-end">
                  <span className="font-medium">
                    {match.awayTeam?.name || "Unknown Team"}
                  </span>
                  {match.awayTeam?.crest && (
                    <img
                      src={match.awayTeam.crest}
                      alt=""
                      className="w-8 h-8"
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-12 bg-[#242937] rounded-lg">
            No matches scheduled for this date
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;
