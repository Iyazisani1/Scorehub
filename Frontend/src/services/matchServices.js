import { footballDataApi } from "../config/apiConfig";

export const getHeadToHead = async (matchId) => {
  try {
    const response = await footballDataApi.get(
      `/matches/${matchId}/head2head?limit=5`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching head to head data:", error);
    throw error;
  }
};

export const getMatchTimeline = async (matchId) => {
  try {
    const response = await footballDataApi.get(`/matches/${matchId}/timeline`);
    return response.data;
  } catch (error) {
    console.error("Error fetching match timeline:", error);
    throw error;
  }
};
