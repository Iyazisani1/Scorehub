import React, { useEffect, useState, useMemo } from "react";
import { getTransfers, withRetry } from "../config/apiConfig";

const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamId, setTeamId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [transferType, setTransferType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [timeFrame, setTimeFrame] = useState("recent"); // "recent", "last5", "all"

  // Get current year for filtering recent transfers
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Popular teams with IDs from the API
  const popularTeams = useMemo(
    () => [
      {
        id: "33",
        name: "Manchester United",
        country: "England",
        logo: "/man-utd.png",
      },
      {
        id: "50",
        name: "Manchester City",
        country: "England",
        logo: "/man-city.png",
      },
      {
        id: "40",
        name: "Liverpool",
        country: "England",
        logo: "/liverpool.png",
      },
      { id: "42", name: "Arsenal", country: "England", logo: "/arsenal.png" },
      {
        id: "47",
        name: "Tottenham",
        country: "England",
        logo: "/tottenham.png",
      },
      { id: "49", name: "Chelsea", country: "England", logo: "/chelsea.png" },
      {
        id: "85",
        name: "Real Madrid",
        country: "Spain",
        logo: "/real-madrid.png",
      },
      {
        id: "529",
        name: "Barcelona",
        country: "Spain",
        logo: "/barcelona.png",
      },
      {
        id: "530",
        name: "Atletico Madrid",
        country: "Spain",
        logo: "/atletico.png",
      },
      {
        id: "157",
        name: "Bayern Munich",
        country: "Germany",
        logo: "/bayern.png",
      },
      {
        id: "165",
        name: "Borussia Dortmund",
        country: "Germany",
        logo: "/dortmund.png",
      },
      { id: "496", name: "Juventus", country: "Italy", logo: "/juventus.png" },
      { id: "489", name: "AC Milan", country: "Italy", logo: "/milan.png" },
      { id: "505", name: "Inter Milan", country: "Italy", logo: "/inter.png" },
      { id: "85", name: "PSG", country: "France", logo: "/psg.png" },
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
        setTransfers(data);
      } catch (error) {
        setError(error.message || "Failed to fetch transfers");
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, [teamId]);

  // Filter and sort transfers
  const filteredTransfers = useMemo(() => {
    return transfers
      .filter((transfer) => {
        const playerName = transfer.player?.name?.toLowerCase() || "";
        const teamOut =
          transfer.transfers?.[0]?.teams?.out?.name?.toLowerCase() || "";
        const teamIn =
          transfer.transfers?.[0]?.teams?.in?.name?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        const transferDate = new Date(transfer.transfers?.[0]?.date || 0);
        const transferYear = transferDate.getFullYear();

        // Filter by time frame
        let timeFrameMatches = true;
        if (timeFrame === "recent") {
          // Show only transfers from the last 2 seasons
          timeFrameMatches = transferYear >= currentYear - 2;
        } else if (timeFrame === "last5") {
          // Show only transfers from the last 5 seasons
          timeFrameMatches = transferYear >= currentYear - 5;
        }

        // Filter by search query
        const matchesSearch =
          !searchQuery ||
          playerName.includes(query) ||
          teamOut.includes(query) ||
          teamIn.includes(query);

        // Filter by transfer type
        const move = transfer.transfers?.[0] || {};
        const transferTypeMatches =
          transferType === "all" ||
          (transferType === "in" && move.teams?.in?.id === teamId) ||
          (transferType === "out" && move.teams?.out?.id === teamId);

        return matchesSearch && transferTypeMatches && timeFrameMatches;
      })
      .sort((a, b) => {
        const moveA = a.transfers?.[0] || {};
        const moveB = b.transfers?.[0] || {};

        switch (sortBy) {
          case "date":
            const dateA = new Date(moveA.date || 0);
            const dateB = new Date(moveB.date || 0);
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
          case "name":
            const nameA = a.player?.name || "";
            const nameB = b.player?.name || "";
            return sortOrder === "asc"
              ? nameA.localeCompare(nameB)
              : nameB.localeCompare(nameA);
          default:
            return 0;
        }
      });
  }, [
    transfers,
    searchQuery,
    transferType,
    sortBy,
    sortOrder,
    teamId,
    timeFrame,
    currentYear,
  ]);

  // Group teams by country for dropdown
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

  // Format transfer fee display
  const formatTransferFee = (transfer) => {
    const type = transfer?.type || "";
    const fee = transfer?.fee?.amount || null;

    if (type.toLowerCase() === "free") return "Free Transfer";
    if (type.toLowerCase().includes("loan")) return "Loan";
    if (fee) return `€${fee.toLocaleString()}`;
    return "Undisclosed Fee";
  };

  // Get season display
  const getTransferSeason = (date) => {
    if (!date) return "Unknown Season";
    const transferDate = new Date(date);
    const month = transferDate.getMonth();
    const year = transferDate.getFullYear();

    // Summer transfer window is typically June-August
    if (month >= 5 && month <= 7) {
      return `Summer ${year}`;
    }
    // Winter transfer window is typically January
    else if (month >= 0 && month <= 1) {
      return `Winter ${year}`;
    }
    return `${year}`;
  };

  return (
    <div className="p-6 bg-[#1a1f2c] text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Transfer Market</h2>

        {/* Controls Section */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Team Selection */}
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

            {/* Search Input */}
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

            {/* Time Frame Selection */}
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

            {/* Filter By Transfer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Transfer Type
              </label>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-2 rounded ${
                    transferType === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setTransferType("all")}
                >
                  All
                </button>
                <button
                  className={`px-3 py-2 rounded ${
                    transferType === "in"
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setTransferType("in")}
                >
                  Incoming
                </button>
                <button
                  className={`px-3 py-2 rounded ${
                    transferType === "out"
                      ? "bg-red-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setTransferType("out")}
                >
                  Outgoing
                </button>
              </div>
            </div>
          </div>

          {/* Second row of controls */}
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

        {/* Status Messages */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Loading transfers...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-white p-4 rounded-md mb-6">
            <p>Error: {error}</p>
            <button
              className="mt-2 bg-red-700 px-4 py-1 rounded-md hover:bg-red-600"
              onClick={() => {
                if (teamId) {
                  setLoading(true);
                  setError(null);
                  withRetry(() => getTransfers(teamId), 3, 1000)
                    .then((data) => {
                      setTransfers(data);
                      setLoading(false);
                    })
                    .catch((err) => {
                      setError(err.message || "Failed to fetch transfers");
                      setLoading(false);
                    });
                }
              }}
            >
              Retry
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

        {/* Transfers Grid */}
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

            {/* Group transfers by season */}
            {Object.entries(
              filteredTransfers.reduce((acc, transfer) => {
                const season = getTransferSeason(transfer.transfers?.[0]?.date);
                if (!acc[season]) acc[season] = [];
                acc[season].push(transfer);
                return acc;
              }, {})
            )
              .sort(([seasonA], [seasonB]) => {
                // Extract year from season string
                const yearA = parseInt(seasonA.match(/\d{4}/)?.[0] || "0");
                const yearB = parseInt(seasonB.match(/\d{4}/)?.[0] || "0");
                // Sort most recent seasons first
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

                            {/* Transfer Details */}
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

                            {/* Transfer Fee */}
                            <div className="bg-gray-700 rounded p-2 text-center">
                              <span className="text-sm text-gray-400 mr-1">
                                Fee:
                              </span>
                              <span className="font-semibold">
                                {formatTransferFee(move)}
                              </span>
                            </div>

                            {/* Date */}
                            <div className="mt-3 text-right text-xs text-gray-500">
                              {move.date || "Date unknown"}
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

        {/* No Team Selected State */}
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
