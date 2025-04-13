import axios from "axios";

export const API_KEY = "6cb666a1bff446ed89440a2eddaafdb4";
export const BASE_URL = "/api/football-data";
export const API_FOOTBALL_BASE_URL = "/api/api-football";
export const API_FOOTBALL_KEY = "0471c6e8bfb64a1b5e0e80da4b5c0b32";

export const COMPETITION_CODES = {
  PL: "2021", // Premier League
  CL: "2001", // Champions League
  EL: "2146", // Europa League
  PD: "2014", // La Liga
  SA: "2019", // Serie A
  BL1: "2002", // Bundesliga
  FL1: "2015", // Ligue 1
};

const cache = new Map();

export const footballDataApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Auth-Token": API_KEY,
    Accept: "application/json",
  },
});

export const apiFootballApi = axios.create({
  baseURL: API_FOOTBALL_BASE_URL,
  headers: {
    "x-apisports-key": API_FOOTBALL_KEY,
    Accept: "application/json",
  },
});

const cacheResponse = (key, data) => {
  cache.set(key, { data, timeStamp: Date.now() });
};

const getCachedResponse = (key, expiry = 600000) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timeStamp < expiry) {
    return cached.data;
  }
  return null;
};

footballDataApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

footballDataApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || "An unexpected error occurred",
      status: error.response?.status,
      originalError: error,
    };

    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", customError);
    }

    return Promise.reject(customError);
  }
);

apiFootballApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || "An unexpected error occurred",
      status: error.response?.status,
      originalError: error,
    };
    if (process.env.NODE_ENV === "development") {
      console.error("API-Football Error:", customError);
    }
    return Promise.reject(customError);
  }
);

const safeParseDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return date;
  } catch (error) {
    console.error("Error parsing date:", dateString);
    return null;
  }
};

const formatDate = (date) => {
  try {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date().toISOString().split("T")[0];
  }
};

const convertToIST = (utcDateString) => {
  try {
    const date = safeParseDate(utcDateString);
    if (!date) return null;

    const formatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    return formatter.format(date);
  } catch (error) {
    console.error("Error converting to IST:", error);
    return utcDateString;
  }
};

export const getMatches = async (params = {}) => {
  const cacheKey = JSON.stringify(params);
  const cachedData = getCachedResponse(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  try {
    const today = formatDate(new Date());
    const queryParams = {
      date: params.dateFrom || today,
      competitions: params.competitions?.length
        ? params.competitions.join(",")
        : "2021",
      status: params.status?.length ? params.status.join(",") : undefined,
      limit: params.limit || 50,
    };

    const response = await footballDataApi.get("/matches", {
      params: queryParams,
    });

    const matches = response.data.matches || [];
    const formattedMatches = matches.map((match) => ({
      ...match,
      localDate: match.utcDate ? convertToIST(match.utcDate) : null,
      utcDate: match.utcDate,
    }));

    cacheResponse(cacheKey, formattedMatches);
    return formattedMatches;
  } catch (error) {
    console.error(
      "Error fetching matches:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to fetch matches");
  }
};

export const getMatchDetails = async (matchId) => {
  const cacheKey = `match-${matchId}`;
  const cachedData = getCachedResponse(cacheKey);
  if (cachedData) return cachedData;

  try {
    // Fetch basic match details from football-data.org
    const footballDataResponse = await footballDataApi.get(
      `/matches/${matchId}`
    );
    const match = footballDataResponse.data;

    const leagueMapping = {
      2021: 39,
      2001: 2,
      2014: 140,
      2019: 135,
      2002: 78,
      2015: 61,
    };

    const apiFootballLeagueId = leagueMapping[match.competition.id] || null;
    let enhancedData = {};

    if (apiFootballLeagueId) {
      const matchDate = formatDate(match.utcDate);

      const apiFootballResponse = await apiFootballApi.get("/fixtures", {
        params: {
          league: apiFootballLeagueId,
          date: matchDate,
          season: new Date(match.utcDate).getFullYear(),
        },
      });

      const apiMatch = apiFootballResponse.data.response.find(
        (m) =>
          m.teams.home.name
            .toLowerCase()
            .includes(match.homeTeam.name.toLowerCase()) &&
          m.teams.away.name
            .toLowerCase()
            .includes(match.awayTeam.name.toLowerCase())
      );

      if (apiMatch) {
        enhancedData = {
          events: apiMatch.events || [],
          lineups: apiMatch.lineups || [],
          fixtureId: apiMatch.fixture.id,
        };
      }
    }

    const formattedMatch = {
      data: {
        ...match,
        localDate: match.utcDate ? convertToIST(match.utcDate) : null,
        utcDate: match.utcDate,
        events: enhancedData.events || [],
        lineups: enhancedData.lineups || [],
      },
      apiFootballFixtureId: enhancedData.fixtureId || null,
    };

    cacheResponse(cacheKey, formattedMatch);
    return formattedMatch;
  } catch (error) {
    console.error("Error fetching match details:", error);
    throw new Error(error.message || "Failed to fetch match details");
  }
};

export const getTransfers = async (teamId) => {
  try {
    const response = await apiFootballApi.get(`/transfers`, {
      params: { team: teamId },
    });
    return response.data.response;
  } catch (error) {
    console.error("Error fetching transfers:", error);
    throw new Error("Failed to fetch transfers");
  }
};

export const LEAGUE_DATA = {
  PL: {
    id: 2021,
    name: "Premier League",
    code: "PL",
    country: "England",
    emblem: "/premier-league.png",
  },
  CL: {
    id: 2001,
    name: "UEFA Champions League",
    code: "CL",
    country: "Europe",
    emblem: "/champions-league.png",
  },
  EL: {
    id: 2146,
    name: "UEFA Europa League",
    code: "EL",
    country: "Europe",
    emblem: "/europa-league.png",
  },
  PD: {
    id: 2014,
    name: "La Liga",
    code: "PD",
    country: "Spain",
    emblem: "/la-liga.png",
  },
  SA: {
    id: 2019,
    name: "Serie A",
    code: "SA",
    country: "Italy",
    emblem: "/serie-a.png",
  },
  BL1: {
    id: 2002,
    name: "Bundesliga",
    code: "BL1",
    country: "Germany",
    emblem: "/bundesliga.png",
  },
  FL1: {
    id: 2015,
    name: "Ligue 1",
    code: "FL1",
    country: "France",
    emblem: "/ligue-1.png",
  },
};

export const withRetry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};

export const getMatchHead2Head = async (homeTeamId, awayTeamId, fixtureId) => {
  const cacheKey = `h2h-${homeTeamId}-${awayTeamId}-${fixtureId}`;
  const cachedData = getCachedResponse(cacheKey);
  if (cachedData) return cachedData;

  let h2hData = {
    numberOfMatches: 0,
    homeTeam: {
      wins: 0,
    },
    awayTeam: {
      wins: 0,
    },
  };

  try {
    const footballDataResponse = await footballDataApi.get(
      `/teams/${homeTeamId}/matches`,
      {
        params: { status: "FINISHED", limit: 5 },
      }
    );
    const pastMatches = footballDataResponse.data.matches.filter(
      (match) =>
        match.awayTeam.id === awayTeamId || match.homeTeam.id === awayTeamId
    );
    h2hData = {
      numberOfMatches: pastMatches.length,
      homeTeam: {
        wins: pastMatches.filter((m) => m.score.winner === "HOME_TEAM").length,
      },
      awayTeam: {
        wins: pastMatches.filter((m) => m.score.winner === "AWAY_TEAM").length,
      },
    };

    if (fixtureId) {
      const apiFootballResponse = await apiFootballApi.get(
        "/fixtures/headtohead",
        {
          params: { h2h: `${homeTeamId}-${awayTeamId}`, last: 5 },
        }
      );
      const h2hMatches = apiFootballResponse.data.response;
      if (h2hMatches.length > 0) {
        h2hData = {
          numberOfMatches: h2hMatches.length,
          homeTeam: {
            wins: h2hMatches.filter((m) => m.teams.home.winner).length,
          },
          awayTeam: {
            wins: h2hMatches.filter((m) => m.teams.away.winner).length,
          },
        };
      }
    }

    cacheResponse(cacheKey, h2hData);
    return h2hData;
  } catch (error) {
    console.error("Error fetching H2H:", error);
    return h2hData;
  }
};

export const getLeagueStandings = async (leagueId) => {
  const cacheKey = `standings-${leagueId}`;
  const cachedData = getCachedResponse(cacheKey);
  if (cachedData) return cachedData;
  try {
    const competitionId = LEAGUE_DATA[leagueId]?.id;
    if (!competitionId) {
      throw new Error("Invalid league ID");
    }

    const response = await footballDataApi.get(
      `/competitions/${competitionId}/standings`
    );
    const standings = response.data;
    cacheResponse(cacheKey, standings);
    return standings;
  } catch (error) {
    console.error("Error fetching league standings:", error);
    throw error;
  }
};
