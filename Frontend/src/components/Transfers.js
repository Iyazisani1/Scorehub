import React, { useEffect, useState, useMemo } from "react";
import { getTransfers, withRetry } from "../config/apiConfig";
import { format, parse, isValid } from "date-fns";

const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [teamId, setTeamId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [timeFrame, setTimeFrame] = useState("recent");

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const popularTeams = useMemo(
    () => [
      {
        id: "33",
        name: "Manchester United",
        country: "England",
        logo: "https://media.api-sports.io/football/teams/33.png",
      },
      {
        id: "50",
        name: "Manchester City",
        country: "England",
        logo: "https://media.api-sports.io/football/teams/50.png",
      },
      {
        id: "40",
        name: "Liverpool",
        country: "England",
        logo: "https://media.api-sports.io/football/teams/40.png",
      },
      {
        id: "42",
        name: "Arsenal",
        country: "England",
        logo: "https://media.api-sports.io/football/teams/42.png",
      },
      {
        id: "47",
        name: "Tottenham",
        country: "England",
        logo: "https://media.api-sports.io/football/teams/47.png",
      },
      {
        id: "49",
        name: "Chelsea",
        country: "England",
        logo: "https://media.api-sports.io/football/teams/49.png",
      },
      {
        id: "541",
        name: "Real Madrid",
        country: "Spain",
        logo: "https://media.api-sports.io/football/teams/541.png",
      },
      {
        id: "529",
        name: "Barcelona",
        country: "Spain",
        logo: "https://media.api-sports.io/football/teams/529.png",
      },
      {
        id: "530",
        name: "Atletico Madrid",
        country: "Spain",
        logo: "https://media.api-sports.io/football/teams/530.png",
      },
      {
        id: "157",
        name: "Bayern Munich",
        country: "Germany",
        logo: "https://media.api-sports.io/football/teams/157.png",
      },
      {
        id: "165",
        name: "Borussia Dortmund",
        country: "Germany",
        logo: "https://media.api-sports.io/football/teams/165.png",
      },
      {
        id: "496",
        name: "Juventus",
        country: "Italy",
        logo: "https://media.api-sports.io/football/teams/496.png",
      },
      {
        id: "489",
        name: "AC Milan",
        country: "Italy",
        logo: "https://media.api-sports.io/football/teams/489.png",
      },
      {
        id: "505",
        name: "Inter Milan",
        country: "Italy",
        logo: "https://media.api-sports.io/football/teams/505.png",
      },
      {
        id: "85",
        name: "Paris Saint-Germain",
        country: "France",
        logo: "https://media.api-sports.io/football/teams/85.png",
      },
    ],
    []
  );

  useEffect(() => {
    if (!teamId) return;

    const fetchTransfers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await withRetry(() => getTransfers(teamId), 3, 1000);
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from API");
        }
        setTransfers(
          data.filter(
            (transfer) =>
              transfer.transfers?.[0]?.teams?.in &&
              transfer.transfers?.[0]?.teams?.out &&
              transfer.player
          )
        );
      } catch (error) {
        console.error("Error fetching transfers:", error);
        setError(error.message || "Failed to fetch transfers");
        setRetryCount((prev) => prev + 1);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, [teamId]);

  const filteredTransfers = useMemo(() => {
    if (!transfers.length) return [];

    return transfers
      .filter((transfer) => {
        const move = transfer.transfers?.[0];
        if (!move) return false;

        const playerName = transfer.player?.name?.toLowerCase() || "";
        const teamOut = move.teams?.out?.name?.toLowerCase() || "";
        const teamIn = move.teams?.in?.name?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();

        let transferDate;
        try {
          transferDate = parse(move.date || "", "yyyy-MM-dd", new Date());

          if (!isValid(transferDate)) {
            const timestamp = parseInt(move.date);
            if (!isNaN(timestamp)) {
              transferDate = new Date(
                timestamp * (timestamp < 10000000000 ? 1000 : 1)
              );
            }
          }

          if (!isValid(transferDate)) {
            transferDate = new Date(move.date);
          }

          const currentYear = new Date().getFullYear();
          if (transferDate.getFullYear() > currentYear + 1) {
            console.warn(
              "Filtering out future transfer:",
              move.date,
              transferDate.toISOString()
            );
            return false;
          }
        } catch (error) {
          console.error("Error parsing transfer date:", move.date, error);
          return false;
        }

        if (!isValid(transferDate)) {
          console.warn("Invalid transfer date filtered out:", move.date);
          return false;
        }

        const transferYear = transferDate.getFullYear();

        let timeFrameMatches = true;
        if (timeFrame === "recent") {
          timeFrameMatches = transferYear >= currentYear - 2;
        } else if (timeFrame === "last5") {
          timeFrameMatches = transferYear >= currentYear - 5;
        }

        const matchesSearch =
          !searchQuery ||
          playerName.includes(query) ||
          teamOut.includes(query) ||
          teamIn.includes(query);

        return matchesSearch && timeFrameMatches;
      })
      .sort((a, b) => {
        const moveA = a.transfers?.[0];
        const moveB = b.transfers?.[0];

        if (!moveA || !moveB) return 0;

        switch (sortBy) {
          case "date": {
            const dateA = parse(moveA.date || "", "yyyy-MM-dd", new Date());
            const dateB = parse(moveB.date || "", "yyyy-MM-dd", new Date());
            if (!isValid(dateA) || !isValid(dateB)) return 0;
            return sortOrder === "asc"
              ? dateA.getTime() - dateB.getTime()
              : dateB.getTime() - dateA.getTime();
          }
          case "name":
            return sortOrder === "asc"
              ? (a.player?.name || "").localeCompare(b.player?.name || "")
              : (b.player?.name || "").localeCompare(a.player?.name || "");
          default:
            return 0;
        }
      });
  }, [
    transfers,
    searchQuery,
    sortBy,
    sortOrder,
    teamId,
    timeFrame,
    currentYear,
  ]);

  const teamsByCountry = useMemo(() => {
    const groupedTeams = {};
    popularTeams.forEach((team) => {
      if (!groupedTeams[team.country]) {
        groupedTeams[team.country] = [];
      }
      groupedTeams[team.country].push(team);
    });
    return groupedTeams;
  }, [popularTeams]);

  const formatTransferFee = (transfer) => {
    const type = transfer?.type || "";
    const fee = transfer?.fee?.amount || null;

    if (type.toLowerCase() === "free") return "Free Transfer";
    if (type.toLowerCase().includes("loan")) return "Loan";
    if (fee) return `€${fee.toLocaleString()}`;
    return "Undisclosed Fee";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date unknown";
    try {
      console.log("Formatting date:", dateString, typeof dateString);

      const currentYear = new Date().getFullYear();

      let date = parse(dateString, "yyyy-MM-dd", new Date());

      if (!isValid(date)) {
        const timestamp = parseInt(dateString);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp * (timestamp < 10000000000 ? 1000 : 1));
        }
      }

      if (!isValid(date)) {
        date = new Date(dateString);
      }

      if (!isValid(date)) {
        console.warn("Invalid date:", dateString);
        return "Date unknown";
      }

      if (date.getFullYear() > currentYear + 1) {
        console.warn("Future date detected:", dateString, date.toISOString());
        return "Date unknown";
      }

      return format(date, "d MMMM yyyy");
    } catch (error) {
      console.error("Error parsing date:", dateString, error);
      return "Date unknown";
    }
  };

  const getTransferSeason = (date) => {
    if (!date) return "Unknown Season";
    try {
      console.log("Getting season for date:", date, typeof date);

      const currentYear = new Date().getFullYear();

      let transferDate = parse(date, "yyyy-MM-dd", new Date());

      if (!isValid(transferDate)) {
        const timestamp = parseInt(date);
        if (!isNaN(timestamp)) {
          transferDate = new Date(
            timestamp * (timestamp < 10000000000 ? 1000 : 1)
          );
        }
      }

      if (!isValid(transferDate)) {
        transferDate = new Date(date);
      }

      if (!isValid(transferDate)) {
        console.warn("Invalid transfer date:", date);
        return "Unknown Season";
      }

      if (transferDate.getFullYear() > currentYear + 1) {
        console.warn(
          "Future transfer date detected:",
          date,
          transferDate.toISOString()
        );
        return "Unknown Season";
      }

      const month = transferDate.getMonth();
      const year = transferDate.getFullYear();

      if (month >= 5 && month <= 8) {
        return `Summer ${year}`;
      } else if (month === 11 || month === 0) {
        return `Winter ${year}`;
      }
      return `${format(transferDate, "MMMM yyyy")}`;
    } catch (error) {
      console.error("Error parsing date for season:", date, error);
      return "Unknown Season";
    }
  };

  return (
    <div className="p-6 bg-[#1a1f2c] text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Transfer Market</h2>

        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Select Team
              </label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                onChange={(e) => setTeamId(e.target.value)}
                value={teamId}
              >
                <option value="">Select a Team</option>
                {Object.entries(teamsByCountry).map(([country, teams]) => (
                  <optgroup key={country} label={country}>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search player or club..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Time Period
              </label>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-2 rounded ${
                    timeFrame === "recent"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setTimeFrame("recent")}
                >
                  Recent (2 Seasons)
                </button>
                <button
                  className={`px-3 py-2 rounded ${
                    timeFrame === "last5"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setTimeFrame("last5")}
                >
                  Last 5 Seasons
                </button>
                <button
                  className={`px-3 py-2 rounded ${
                    timeFrame === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setTimeFrame("all")}
                >
                  All Time
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-400 mr-2">
                Sort By:
              </label>
              <select
                className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Date</option>
                <option value="name">Player Name</option>
              </select>
              <button
                className="ml-2 p-2 bg-gray-700 rounded-md"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Loading transfers...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-white p-4 rounded-md mb-6">
            <p className="mb-2">Error: {error}</p>
            <p className="text-sm text-gray-300 mb-3">
              {retryCount >= 3
                ? "Multiple attempts to fetch data have failed. Please try again later."
                : "There was an error loading the transfer data."}
            </p>
            <button
              className="mt-2 bg-red-700 px-4 py-1 rounded-md hover:bg-red-600 transition-colors duration-200"
              onClick={() => {
                setRetryCount(0);
                if (teamId) {
                  setLoading(true);
                  setError(null);
                  withRetry(() => getTransfers(teamId), 3, 1000)
                    .then((data) => {
                      if (!Array.isArray(data)) {
                        throw new Error(
                          "Invalid data format received from API"
                        );
                      }
                      setTransfers(
                        data.filter(
                          (transfer) =>
                            transfer.transfers?.[0]?.teams?.in &&
                            transfer.transfers?.[0]?.teams?.out &&
                            transfer.player
                        )
                      );
                      setLoading(false);
                    })
                    .catch((err) => {
                      setError(err.message || "Failed to fetch transfers");
                      setLoading(false);
                      setRetryCount((prev) => prev + 1);
                    });
                }
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && teamId && filteredTransfers.length === 0 && (
          <div className="bg-gray-800 rounded-md p-6 text-center">
            <p className="text-gray-400">
              No transfers found for the selected criteria.
            </p>
            {timeFrame !== "all" && (
              <button
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
                onClick={() => setTimeFrame("all")}
              >
                Show All Transfers
              </button>
            )}
          </div>
        )}

        {!loading && filteredTransfers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400">
                Found {filteredTransfers.length} transfer
                {filteredTransfers.length !== 1 ? "s" : ""}
              </p>

              {timeFrame !== "all" && filteredTransfers.length > 0 && (
                <div className="text-sm text-gray-400">
                  {timeFrame === "recent"
                    ? `Showing transfers from the last 2 seasons`
                    : timeFrame === "last5"
                    ? `Showing transfers from the last 5 seasons`
                    : ""}
                </div>
              )}
            </div>

            {Object.entries(
              filteredTransfers.reduce((acc, transfer) => {
                const season = getTransferSeason(transfer.transfers?.[0]?.date);
                if (!acc[season]) acc[season] = [];
                acc[season].push(transfer);
                return acc;
              }, {})
            )
              .sort(([seasonA], [seasonB]) => {
                const yearA = parseInt(seasonA.match(/\d{4}/)?.[0] || "0");
                const yearB = parseInt(seasonB.match(/\d{4}/)?.[0] || "0");
                return yearB - yearA;
              })
              .map(([season, seasonTransfers]) => (
                <div key={season} className="mb-8">
                  <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
                    {season}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seasonTransfers.map((transfer, index) => {
                      const move = transfer.transfers?.[0] || {};
                      const isIncoming = move.teams?.in?.id === teamId;

                      return (
                        <div
                          key={index}
                          className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                          <div
                            className={`p-1 text-xs font-semibold text-center text-white ${
                              isIncoming ? "bg-green-600" : "bg-red-600"
                            }`}
                          >
                            {isIncoming ? "INCOMING" : "OUTGOING"}
                          </div>

                          <div className="p-4">
                            {/* Player Info */}
                            <div className="flex items-center mb-4">
                              <div className="bg-gray-700 rounded-full h-12 w-12 flex items-center justify-center overflow-hidden mr-3">
                                {transfer.player.image ? (
                                  <img
                                    src={transfer.player.image}
                                    alt={transfer.player.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xl">👤</span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-lg">
                                  {transfer.player.name}
                                </h4>
                                <p className="text-sm text-gray-400">
                                  {transfer.player.age
                                    ? `Age: ${transfer.player.age}`
                                    : ""}
                                  {transfer.player.position
                                    ? ` • ${transfer.player.position}`
                                    : ""}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                              <div className="text-center">
                                <div className="text-sm text-gray-400">
                                  From
                                </div>
                                <div className="font-medium">
                                  {move.teams?.out?.name || "Unknown"}
                                </div>
                              </div>

                              <div className="text-center text-gray-500">→</div>

                              <div className="text-center">
                                <div className="text-sm text-gray-400">To</div>
                                <div className="font-medium">
                                  {move.teams?.in?.name || "Unknown"}
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-700 rounded p-2 text-center">
                              <span className="text-sm text-gray-400 mr-1">
                                Fee:
                              </span>
                              <span className="font-semibold">
                                {formatTransferFee(move)}
                              </span>
                            </div>

                            <div className="mt-3 text-right text-xs text-gray-500">
                              {formatDate(move.date)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}

        {!teamId && !loading && (
          <div className="bg-gray-800 rounded-md p-8 text-center">
            <h3 className="text-xl font-bold mb-4">
              Select a team to view recent transfers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto">
              {popularTeams.slice(0, 10).map((team) => (
                <button
                  key={team.id}
                  className="bg-gray-700 hover:bg-gray-600 rounded-md p-3 transition-colors duration-200 flex flex-col items-center"
                  onClick={() => setTeamId(team.id)}
                >
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-2">
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <span>⚽</span>
                    )}
                  </div>
                  <span className="text-xs text-center">{team.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transfers;
