import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { footballDataApi, LEAGUE_DATA } from "../config/apiConfig";
import StandingsPage from "./StandingsPage";
import TopScorers from "./TopScorers";
import { MatchCard } from "./MatchCard";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trophy,
  Users,
  Loader2,
} from "lucide-react";

export default function LeagueOverview() {
  const { id: leagueId } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSeason, setSelectedSeason] = useState("2024");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [leagueStats, setLeagueStats] = useState(null);

  const leagueData = LEAGUE_DATA[leagueId?.toUpperCase()] || {};
  const leagueName = leagueData.name || "League";
  const leagueEmblem = leagueData.emblem || "";

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        setLoading(true);
        setError(null);

        const competitionCode = LEAGUE_DATA[leagueId?.toUpperCase()]?.code;
        if (!competitionCode) {
          throw new Error("Invalid league ID");
        }

        // Fetch both matches and competition info in parallel
        const [matchesResponse, competitionResponse] = await Promise.all([
          footballDataApi.get(
            `/competitions/${competitionCode}/matches?season=${selectedSeason}`
          ),
          footballDataApi.get(`/competitions/${competitionCode}`),
        ]);

        if (matchesResponse.data && matchesResponse.data.matches) {
          // Group matches by status
          const groupedMatches = matchesResponse.data.matches.reduce(
            (acc, match) => {
              const status = match.status;
              if (!acc[status]) acc[status] = [];
              acc[status].push(match);
              return acc;
            },
            {}
          );

          setMatches(groupedMatches);
        } else {
          setMatches({});
        }

        // Set league stats
        setLeagueStats(competitionResponse.data);
      } catch (err) {
        console.error("Data Fetch Error:", err);
        setError(err.message || "Failed to fetch league data");
      } finally {
        setLoading(false);
      }
    };

    if (leagueId) fetchLeagueData();
  }, [leagueId, selectedSeason]);

  const handlePrevMatch = () => {
    setCurrentMatchIndex((prevIndex) =>
      prevIndex === 0 ? matches.SCHEDULED?.length - 1 : prevIndex - 1
    );
  };

  const handleNextMatch = () => {
    setCurrentMatchIndex((prevIndex) =>
      prevIndex === matches.SCHEDULED?.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (error) {
    return (
      <div className="p-4 text-white bg-gray-900 min-h-screen">
        <div className="bg-red-900/50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error Loading League Data</h2>
          <p className="text-gray-300">
            Please check the league ID and try again.
          </p>
          <p className="text-gray-400 mt-2">
            Available leagues: {Object.keys(LEAGUE_DATA).join(", ")}
          </p>
        </div>
      </div>
    );
  }

  const renderMatchesSection = (title, matches = [], icon) => {
    if (!matches.length) return null;
    return (
      <div className="bg-[#1e2330] rounded-lg p-4 mb-4">
        <div className="flex items-center mb-4">
          {icon}
          <h3 className="text-lg font-semibold ml-2">{title}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.slice(0, 6).map((match) => (
            <div
              key={match.id}
              className="bg-[#2d3546] rounded-lg p-4 hover:bg-[#3a4359] transition-colors"
            >
              <MatchCard match={match} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      {/* League Header */}
      <div className="bg-gray-800 p-6 rounded-lg flex justify-between items-center mb-6">
        <div className="flex items-center">
          {leagueEmblem && (
            <img
              src={leagueEmblem}
              alt={`${leagueName} emblem`}
              className="w-12 h-12 mr-4 bg-white p-1 rounded-lg"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{leagueName}</h1>
            {leagueStats && (
              <div className="flex items-center text-sm text-gray-400 mt-1">
                <Users className="w-4 h-4 mr-1" />
                <span>{leagueStats.numberOfTeams} Teams</span>
                <span className="mx-2">•</span>
                <Trophy className="w-4 h-4 mr-1" />
                <span>Season {selectedSeason}</span>
              </div>
            )}
          </div>
        </div>
        <select
          className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
        >
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 rounded-lg mb-6">
        <div className="flex space-x-1 p-1">
          {[
            {
              id: "overview",
              label: "Overview",
              icon: <Calendar className="w-4 h-4" />,
            },
            {
              id: "table",
              label: "Table",
              icon: <Trophy className="w-4 h-4" />,
            },
            {
              id: "topscorers",
              label: "Top Scorers",
              icon: <Users className="w-4 h-4" />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {renderMatchesSection(
                "Live Matches",
                matches.LIVE || matches.IN_PLAY,
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
              {renderMatchesSection(
                "Upcoming Matches",
                matches.SCHEDULED || matches.TIMED,
                <Calendar className="w-5 h-5 text-blue-400" />
              )}
              {renderMatchesSection(
                "Recent Results",
                matches.FINISHED?.slice(-6),
                <Trophy className="w-5 h-5 text-yellow-400" />
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "table" && (
        <div className="mt-6">
          <StandingsPage leagueId={leagueId} season={selectedSeason} />
        </div>
      )}

      {activeTab === "topscorers" && (
        <div className="mt-6">
          <TopScorers leagueId={leagueId} season={selectedSeason} />
        </div>
      )}
    </div>
  );
}
