// Minimal daily challenge state management
export const dailyState = {
  lastPlayedDate: null,    // "2024-12-21" format
  currentStreak: 0,
  bestStreak: 0,
  lastGameData: null        // Stores complete game state for review
};

export function loadDailyState() {
  const saved = localStorage.getItem('dailyChallenge');
  if (saved) {
    Object.assign(dailyState, JSON.parse(saved));
  }
}

export function saveDailyState() {
  localStorage.setItem('dailyChallenge', JSON.stringify(dailyState));
}

export function getTodayDateCT() {
  // Get current date in Chicago time (YYYY-MM-DD format)
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
}

export function hasPlayedToday() {
  return dailyState.lastPlayedDate === getTodayDateCT();
}

export function updateDailyResult(gameData = null) {
  const today = getTodayDateCT();

  // Skip if already played today
  if (dailyState.lastPlayedDate === today) return;

  // Get yesterday in Chicago time by getting Chicago's current date/time and subtracting a day
  const chicagoNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
  chicagoNow.setDate(chicagoNow.getDate() - 1);
  const yesterdayStr = chicagoNow.toISOString().split('T')[0];

  // Update streak based on consecutive play
  dailyState.currentStreak = (dailyState.lastPlayedDate === yesterdayStr)
    ? dailyState.currentStreak + 1
    : 1;

  dailyState.bestStreak = Math.max(dailyState.bestStreak, dailyState.currentStreak);
  dailyState.lastPlayedDate = today;

  // Save game data for review if provided
  if (gameData) {
    dailyState.lastGameData = gameData;
  }

  saveDailyState();
}

export function getTimeUntilMidnightCT() {
  // Get current Chicago time and calculate time until midnight
  const chicagoNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const midnight = new Date(chicagoNow);
  midnight.setHours(24, 0, 0, 0);

  const msUntilMidnight = midnight - chicagoNow;
  const hours = Math.floor(msUntilMidnight / (1000 * 60 * 60));
  const mins = Math.floor((msUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${mins}m`;
}

export function getChallengeNumber() {
  // Calculate the number of days since February 5, 2025 (Chicago timezone)
  const startDate = new Date('2025-02-05T00:00:00');
  const chicagoNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));

  // Get Chicago date at midnight for accurate day calculation
  const chicagoToday = new Date(chicagoNow);
  chicagoToday.setHours(0, 0, 0, 0);

  // Calculate difference in days
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceStart = Math.floor((chicagoToday - startDate) / msPerDay) + 1;

  // Return at least 1
  return Math.max(1, daysSinceStart);
}