import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMatchDetails, getMatchHead2Head } from "../config/apiConfig";
import { Calendar, Clock, Activity, MapPin } from "lucide-react";

const MatchDetails = () => {
  const { matchId } = useParams();
  const [matchData, setMatchData] = useState(null);
  const [head2head, setHead2Head] = useState(null);
  const [activeTab, setActiveTab] = useState("Lineup");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getMatchDetails(matchId);
        const match = response.data;
        setMatchData(match);

        if (response.apiFootballFixtureId && match.status === "SCHEDULED") {
          const h2h = await getMatchHead2Head(
            match.homeTeam.id,
            match.awayTeam.id,
            response.apiFootballFixtureId
          );
          setHead2Head(h2h);
        }
      } catch (error) {
        console.error("Match Details Fetch Error:", error);
        setError("Failed to fetch match details");
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchMatchData();
    }
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-600/90 p-4 rounded-md flex items-center justify-center h-screen">
        <span className="text-white font-medium">{error}</span>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-white">No match data available</span>
      </div>
    );
  }

  const isLive =
    matchData.status === "IN_PLAY" || matchData.status === "PAUSED";
  const isFinished = matchData.status === "FINISHED";
  const isUpcoming = matchData.status === "SCHEDULED";

  const formatDateTime = (utcDate) => {
    return new Date(utcDate).toLocaleString("en-US", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const getAvailableTabs = () => {
    if (isFinished) {
      return ["Lineup", "Stats", "Head-to-Head"];
    } else if (isUpcoming) {
      return ["Head-to-Head"];
    }
    return [];
  };

  const Tabs = () => (
    <div className="flex border-b border-gray-700">
      {getAvailableTabs().map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === tab
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-[#1a1f2c] min-h-screen p-6 font-sans">
      <div className="max-w-4xl mx-auto bg-[#242937] rounded-lg shadow-lg">
        <div className="p-6 text-center border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-2">
            {matchData.homeTeam.name} vs {matchData.awayTeam.name}
          </h1>
          <p className="text-gray-400 text-sm">
            {formatDateTime(matchData.utcDate)} - {matchData.competition.name}
          </p>
          {matchData.venue && (
            <p className="text-gray-400 text-sm mt-1 flex items-center justify-center">
              <MapPin className="w-4 h-4 mr-1" /> {matchData.venue}
            </p>
          )}
        </div>

        <div className="p-6 flex flex-col items-center">
          <div className="flex items-center justify-between w-full max-w-md mb-4">
            <div className="flex flex-col items-center">
              <img
                src={matchData.homeTeam.crest || "/placeholder-team.png"}
                alt={matchData.homeTeam.name}
                className="w-12 h-12 object-contain mb-2"
                onError={(e) => (e.target.src = "/placeholder-team.png")}
              />
              <span className="text-white font-medium">
                {matchData.homeTeam.name}
              </span>
            </div>

            <div className="text-center">
              {isFinished ? (
                <div className="text-3xl font-bold text-white">
                  {matchData.score.fullTime.home} -{" "}
                  {matchData.score.fullTime.away}
                </div>
              ) : isLive ? (
                <div className="text-xl font-bold text-green-500 animate-pulse">
                  LIVE
                </div>
              ) : isUpcoming ? (
                <div className="text-xl font-bold text-yellow-400">
                  Upcoming
                </div>
              ) : null}
              {isFinished && matchData.events?.length > 0 && (
                <div className="text-gray-400 text-sm mt-2">
                  {matchData.events
                    .filter((e) => e.type === "Goal")
                    .map((e, index) => (
                      <span key={index}>
                        {e.player?.name || "Unknown"} {e.time?.elapsed || "N/A"}
                        ’
                        {index <
                          matchData.events.filter((e) => e.type === "Goal")
                            .length -
                            1 && ", "}
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center">
              <img
                src={matchData.awayTeam.crest || "/placeholder-team.png"}
                alt={matchData.awayTeam.name}
                className="w-12 h-12 object-contain mb-2"
                onError={(e) => (e.target.src = "/placeholder-team.png")}
              />
              <span className="text-white font-medium">
                {matchData.awayTeam.name}
              </span>
            </div>
          </div>
        </div>

        {(isFinished || isUpcoming) && <Tabs />}
        {(isFinished || isUpcoming) && (
          <div className="p-6">
            {activeTab === "Lineup" &&
              isFinished &&
              matchData.lineups?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Lineups</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {matchData.lineups.map((teamLineup, index) => (
                      <div key={index}>
                        <h4 className="text-white font-semibold mb-2">
                          {teamLineup.team.name}
                        </h4>
                        <ul className="text-gray-400 space-y-1">
                          {teamLineup.startXI?.map((player) => (
                            <li key={player.player.id}>
                              {player.player.name} (# {player.player.number})
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {activeTab === "Stats" &&
              isFinished &&
              matchData.events?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Match Stats
                  </h3>
                  <ul className="text-gray-400 space-y-2">
                    {matchData.events
                      .filter(
                        (e) =>
                          e.type === "Goal" ||
                          e.detail === "Yellow Card" ||
                          e.detail === "Red Card"
                      )
                      .map((event, index) => (
                        <li key={index} className="flex justify-between">
                          <span className="text-white">
                            {event.time?.elapsed || "N/A"}’
                          </span>
                          <span>
                            {event.player?.name || "Unknown"} (
                            {event.team?.name || "N/A"})
                          </span>
                          {event.type === "Goal" && (
                            <span className="text-green-400">⚽</span>
                          )}
                          {event.detail === "Yellow Card" && (
                            <span className="text-yellow-400">🟨</span>
                          )}
                          {event.detail === "Red Card" && (
                            <span className="text-red-400">🟥</span>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

            {activeTab === "Head-to-Head" && head2head && (
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Head-to-Head
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center text-gray-400">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {head2head.numberOfMatches}
                    </p>
                    <p>Total Matches</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {head2head.homeTeam.wins}
                    </p>
                    <p>{matchData.homeTeam.name} Wins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {head2head.awayTeam.wins}
                    </p>
                    <p>{matchData.awayTeam.name} Wins</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchDetails;
