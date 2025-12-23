import { gamesURL } from "../other/config.js";

export async function fetchGames(timeControlSelection, roundsSelection) {
  const gamesURLWithParam =
    gamesURL + `?event=${timeControlSelection}&limit=${roundsSelection}`;

  try {
    const response = await fetch(gamesURLWithParam);
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error sending data:", error);
  }
}

export async function fetchDailyGame() {
  // Fetch today's daily challenge game
  const url = gamesURL.replace('games-v2', 'daily-game');

  try {
    const response = await fetch(url);
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error fetching daily game:", error);
  }
}
