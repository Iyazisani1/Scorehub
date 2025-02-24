import axios from "axios";

const API_KEY = "6cb666a1bff446ed89440a2eddaafdb4";
const BASE_URL = "/api/football-data";
const cache = new Map();

// Create base axios instance
export const footballDataApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Auth-Token": API_KEY,
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

// Add request interceptor to handle errors consistently
footballDataApi.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
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

// Safe date parser that handles invalid dates
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

// Format date to YYYY-MM-DD safely
const formatDate = (date) => {
  try {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date().toISOString().split("T")[0]; // Return today's date as fallback
  }
};

// Convert UTC to IST safely
const convertToIST = (utcDateString) => {
  try {
    const date = safeParseDate(utcDateString);
    if (!date) return null;

    // Create formatter for IST
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
    return utcDateString; // Return original string if conversion fails
  }
};

// Centralized request functions with better error handling
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
        : "2021", // Default to Premier League
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
      // Keep the original UTC date for reference
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
    const response = await footballDataApi.get(`/matches/${matchId}`);
    const match = response.data;
    const formattedMatch = {
      data: {
        ...match,
        localDate: match.utcDate ? convertToIST(match.utcDate) : null,
        utcDate: match.utcDate,
      },
    };

    cacheResponse(cacheKey, formattedMatch);
    return formattedMatch;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch match details");
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

// Add retry logic for failed requests
export const withRetry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};

export const getMatchHead2Head = async (homeTeamId, awayTeamId) => {
  try {
    const response = await footballDataApi.get(`/teams/${homeTeamId}/matches`, {
      params: { status: "FINISHED", limit: 5 },
    });

    const pastMatches = response.data.matches.filter(
      (match) =>
        match.awayTeam.id === awayTeamId || match.homeTeam.id === awayTeamId
    );

    return {
      numberOfMatches: pastMatches.length,
      homeTeam: {
        wins: pastMatches.filter((match) => match.winner === "HOME_TEAM")
          .length,
      },
      awayTeam: {
        wins: pastMatches.filter((match) => match.winner === "AWAY_TEAM")
          .length,
      },
    };
  } catch (error) {
    throw new Error("Failed to fetch head-to-head matches");
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
