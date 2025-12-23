import { processSelections } from "./other/utils.js";
import { loadDailyState, hasPlayedToday, getTimeUntilMidnightCT, dailyState } from "./data/daily.js";

const gameModesButtons = document.querySelectorAll(".gameModesButtons");
const classicButton = document.getElementById("classicButton");
const dailyChallengeButton = document.getElementById("dailyChallengeButton");
const endlessModeButton = document.getElementById("endlessModeButton");

// Unified elements
const optionTitle = document.getElementById("optionTitle");
const optionsContainer = document.getElementById("optionsContainer");
const dailyChallengeStats = document.getElementById("dailyChallengeStats");
const startGameButton = document.getElementById("startGameButton");

// Option controls (single set for all modes)
const timeControlNext = document.getElementById("timeControlNext");
const timeControlPrev = document.getElementById("timeControlPrev");
const evalNext = document.getElementById("evalNext");
const evalPrev = document.getElementById("evalPrev");
const timeLimitNext = document.getElementById("timeLimitNext");
const timeLimitPrev = document.getElementById("timeLimitPrev");

const musicToggleButton = document.getElementById("musicToggleButton");
const music = document.getElementById("music");
const fullscreenToggleButton = document.getElementById("fullscreenToggleButton");

// Initialize constants
const distinctTimeControlOptions = ["Bullet", "Blitz", "Rapid", "Classical"];
const timeControlOptions = ["Any", ...distinctTimeControlOptions];
const timeLimitOptions = ["None", "90s", "45s"];
const evalOptions = ["Yes", "No"];

// Track the current game mode
export let currentGameMode = "classic";

// Store options for each game mode
const gameModeOptions = {
  classic: {
    timeControlSelection: timeControlOptions[0],
    evalSelection: evalOptions[0],
    timeLimitSelection: timeLimitOptions[0],
  },
  endless: {
    timeControlSelection: timeControlOptions[0],
    evalSelection: evalOptions[0],
    timeLimitSelection: timeLimitOptions[0],
  },
  daily: {
    // Daily challenge options (placeholder for now)
  }
};

// Current option indices
let timeControlIndex = 0;
let evalIndex = 0;
let timeLimitIndex = 0;

export let gameConfigs = processSelections(gameModeOptions.classic);

let intervalId;

// Function to update UI based on current game mode
export function updateUIForMode() {
  const currentOptions = gameModeOptions[currentGameMode];

  if (currentGameMode === "daily") {
    // Daily Challenge
    const played = hasPlayedToday();
    const timeUntilNext = getTimeUntilMidnightCT();

    // Update option title
    optionTitle.textContent = "Daily Challenge";

    // Update placeholder content with streak info
    const currentStreakLine = document.getElementById("currentStreakLine");
    const bestStreakLine = document.getElementById("bestStreakLine");
    const nextChallengeLine = document.getElementById("nextChallengeLine");

    if (played) {
      currentStreakLine.textContent = "Completed ✓";
      bestStreakLine.textContent = `Current Streak: 🔥 ${dailyState.currentStreak}`;
      nextChallengeLine.textContent = `Next challenge in ${timeUntilNext}`;
      startGameButton.textContent = "Already Played";
      startGameButton.disabled = true;
    } else {
      currentStreakLine.textContent = `Current Streak: 🔥 ${dailyState.currentStreak}`;
      bestStreakLine.textContent = `Best Streak: 🔥 ${dailyState.bestStreak}`;
      nextChallengeLine.textContent = `Next challenge in ${timeUntilNext}`;
      startGameButton.textContent = "Play Daily";
      startGameButton.disabled = false;
    }

    optionsContainer.style.display = "none";
    dailyChallengeStats.style.display = "block";
  } else {
    // Classic or Endless mode
    optionTitle.textContent = "Options";
    optionsContainer.style.display = "grid";
    dailyChallengeStats.style.display = "none";
    startGameButton.disabled = false;

    // Update button text
    if (currentGameMode === "classic") {
      startGameButton.textContent = "Play Classic";
    } else if (currentGameMode === "endless") {
      startGameButton.textContent = "Play Endless";
    }

    // Update option displays
    document.getElementById("timeControlSelection").textContent = currentOptions.timeControlSelection;
    document.getElementById("evalSelection").textContent = currentOptions.evalSelection;
    document.getElementById("timeLimitSelection").textContent = currentOptions.timeLimitSelection;

    // Reset indices to match current values
    timeControlIndex = timeControlOptions.indexOf(currentOptions.timeControlSelection);
    evalIndex = evalOptions.indexOf(currentOptions.evalSelection);
    timeLimitIndex = timeLimitOptions.indexOf(currentOptions.timeLimitSelection);
  }

  // Update game configs
  if (currentGameMode !== "daily") {
    gameConfigs = processSelections(gameModeOptions[currentGameMode]);
  }
}

// Add event listener to each game mode button
gameModesButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove 'active' class from all buttons
    gameModesButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add 'active' class to the clicked button
    button.classList.add("active");

    // Update current game mode
    if (button === classicButton) {
      currentGameMode = "classic";
    } else if (button === dailyChallengeButton) {
      currentGameMode = "daily";
    } else if (button === endlessModeButton) {
      currentGameMode = "endless";
    }

    // Update URL with the selected game mode
    const url = new URL(window.location);
    url.searchParams.set("play", currentGameMode);
    window.history.replaceState({}, "", url);

    // Update UI for the selected mode
    updateUIForMode();

    // Update streak badge when switching modes
    updateStreakBadge();
  });
});

// Function to update streak badge visibility
export function updateStreakBadge() {
  const streakBadge = document.getElementById("streakBadge");
  const streakNumber = document.getElementById("streakNumber");

  if (dailyState.currentStreak > 0) {
    streakNumber.textContent = dailyState.currentStreak;
    streakBadge.style.display = "flex";
  } else {
    streakBadge.style.display = "none";
  }
}

// Load daily state on page load
loadDailyState();
updateStreakBadge();

// Check URL parameters on page load
const urlParams = new URLSearchParams(window.location.search);
const playMode = urlParams.get("play");

// Click the appropriate button based on URL parameter
if (playMode === "endless") {
  endlessModeButton.click();
} else if (playMode === "daily") {
  dailyChallengeButton.click();
} else {
  // Default to classic for any other value or no parameter
  classicButton.click();
}

function updateOption(optionType, action) {
  if (currentGameMode === "daily") return;

  let index, options;

  switch(optionType) {
    case "timeControl":
      options = timeControlOptions;
      index = timeControlIndex;
      break;
    case "eval":
      options = evalOptions;
      index = evalIndex;
      break;
    case "timeLimit":
      options = timeLimitOptions;
      index = timeLimitIndex;
      break;
  }

  if (action === "prev") {
    index = (index - 1 + options.length) % options.length;
  } else if (action === "next") {
    index = (index + 1) % options.length;
  }

  // Update the index and UI
  switch(optionType) {
    case "timeControl":
      timeControlIndex = index;
      document.getElementById("timeControlSelection").textContent = options[index];
      gameModeOptions[currentGameMode].timeControlSelection = options[index];
      break;
    case "eval":
      evalIndex = index;
      document.getElementById("evalSelection").textContent = options[index];
      gameModeOptions[currentGameMode].evalSelection = options[index];
      break;
    case "timeLimit":
      timeLimitIndex = index;
      document.getElementById("timeLimitSelection").textContent = options[index];
      gameModeOptions[currentGameMode].timeLimitSelection = options[index];
      break;
  }

  // Update game configs
  gameConfigs = processSelections(gameModeOptions[currentGameMode]);
}

function startContinuousUpdate(optionType, action) {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    updateOption(optionType, action);
  }, 200);
}

function stopContinuousUpdate() {
  clearInterval(intervalId);
}

// Click handlers for option buttons
timeControlNext.addEventListener("click", () => updateOption("timeControl", "next"));
timeControlPrev.addEventListener("click", () => updateOption("timeControl", "prev"));
evalNext.addEventListener("click", () => updateOption("eval", "next"));
evalPrev.addEventListener("click", () => updateOption("eval", "prev"));
timeLimitNext.addEventListener("click", () => updateOption("timeLimit", "next"));
timeLimitPrev.addEventListener("click", () => updateOption("timeLimit", "prev"));

// Mousedown handlers for continuous update
timeControlNext.addEventListener("mousedown", () => startContinuousUpdate("timeControl", "next"));
timeControlPrev.addEventListener("mousedown", () => startContinuousUpdate("timeControl", "prev"));
evalNext.addEventListener("mousedown", () => startContinuousUpdate("eval", "next"));
evalPrev.addEventListener("mousedown", () => startContinuousUpdate("eval", "prev"));
timeLimitNext.addEventListener("mousedown", () => startContinuousUpdate("timeLimit", "next"));
timeLimitPrev.addEventListener("mousedown", () => startContinuousUpdate("timeLimit", "prev"));

// Stop continuous update on mouseup or mouseleave
document.addEventListener("mouseup", stopContinuousUpdate);
document.addEventListener("mouseleave", stopContinuousUpdate);

// Wheel event handlers
const handleWheelEvent = (optionType, event) => {
  event.preventDefault();
  if (event.deltaY > 0) {
    updateOption(optionType, "next");
    document.getElementById(optionType + "Next").classList.add("active");
  } else if (event.deltaY < 0) {
    updateOption(optionType, "prev");
    document.getElementById(optionType + "Prev").classList.add("active");
  }
  setTimeout(() => {
    document.getElementById(optionType + "Next").classList.remove("active");
    document.getElementById(optionType + "Prev").classList.remove("active");
  }, 200);
};

export function enableSelectionWheelEvents() {
  document.getElementById("evalSelection")?.addEventListener("wheel", (e) => handleWheelEvent("eval", e));
  document.getElementById("timeControlSelection")?.addEventListener("wheel", (e) => handleWheelEvent("timeControl", e));
  document.getElementById("timeLimitSelection")?.addEventListener("wheel", (e) => handleWheelEvent("timeLimit", e));
}

export function disableSelectionWheelEvents() {
  // Create new elements to remove all event listeners
  const evalEl = document.getElementById("evalSelection");
  const timeControlEl = document.getElementById("timeControlSelection");
  const timeLimitEl = document.getElementById("timeLimitSelection");

  if (evalEl) {
    const newEval = evalEl.cloneNode(true);
    evalEl.parentNode.replaceChild(newEval, evalEl);
  }
  if (timeControlEl) {
    const newTimeControl = timeControlEl.cloneNode(true);
    timeControlEl.parentNode.replaceChild(newTimeControl, timeControlEl);
  }
  if (timeLimitEl) {
    const newTimeLimit = timeLimitEl.cloneNode(true);
    timeLimitEl.parentNode.replaceChild(newTimeLimit, timeLimitEl);
  }
}

// Initialize wheel events
enableSelectionWheelEvents();

// Music toggle
musicToggleButton.addEventListener("click", () => {
  musicToggleButton.classList.toggle("active");
  if (music.paused) {
    musicToggleButton.title = "Turn Music Off";
    music.volume = 0.7;
    music.play();
  } else {
    musicToggleButton.title = "Turn Music On";
    music.pause();
  }
});

// Fullscreen toggle
fullscreenToggleButton.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
    });
  } else {
    document.exitFullscreen();
  }
});

// Update button text based on fullscreen status
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    fullscreenToggleButton.title = "Exit Fullscreen";
  } else {
    fullscreenToggleButton.title = "Fullscreen";
  }
});