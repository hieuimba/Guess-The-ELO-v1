// Minimal daily challenge state management
export const dailyState = {
  lastPlayedDate: null,    // "2024-12-21" format
  currentStreak: 0,
  bestStreak: 0
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
  // Get current date in Chicago time
  const ct = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  return new Date(ct).toISOString().split('T')[0];
}

export function hasPlayedToday() {
  return dailyState.lastPlayedDate === getTodayDateCT();
}

export function updateDailyResult(won) {
  const today = getTodayDateCT();

  // Calculate yesterday in CT
  const ctNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const yesterday = new Date(ctNow);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Update streak
  if (won && dailyState.lastPlayedDate === yesterdayStr) {
    dailyState.currentStreak++;
  } else if (won) {
    dailyState.currentStreak = 1;
  }

  dailyState.bestStreak = Math.max(dailyState.bestStreak, dailyState.currentStreak);
  dailyState.lastPlayedDate = today;
  saveDailyState();
}

export function getTimeUntilMidnightCT() {
  // Calculate hours/minutes until midnight Chicago time
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diff = midnight - now;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  return `${hours}h ${mins}m`;
}