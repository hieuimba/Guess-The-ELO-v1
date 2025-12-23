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
  const now = new Date();
  const ctDateStr = now.toLocaleDateString("en-CA", {
    timeZone: "America/Chicago",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return ctDateStr; // Returns YYYY-MM-DD format directly
}

export function hasPlayedToday() {
  return dailyState.lastPlayedDate === getTodayDateCT();
}

export function updateDailyResult() {
  const today = getTodayDateCT();

  // Calculate yesterday in CT
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const yesterdayStr = now.toLocaleDateString("en-CA", {
    timeZone: "America/Chicago",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  // Update streak - playing counts regardless of winning
  if (dailyState.lastPlayedDate === yesterdayStr) {
    // Played yesterday - continue streak
    dailyState.currentStreak++;
  } else if (dailyState.lastPlayedDate !== today) {
    // First time playing today or missed days - start/reset streak to 1
    dailyState.currentStreak = 1;
  }
  // If already played today (lastPlayedDate === today), don't update streak again

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