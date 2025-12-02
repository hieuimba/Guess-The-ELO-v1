# CLAUDE.md - Guess The ELO

> Comprehensive documentation for AI assistants working on the Guess The ELO codebase

## Project Overview

**Guess The ELO** is a casual web-based chess quiz game where players guess the Elo rating of chess matches sourced from Lichess. The game features two modes:
- **Classic**: Fixed number of rounds (5 or 10) with scoring
- **Endless**: Start with 3 lives, survive as long as possible

**Live Site**: https://guesstheelo.com
**Author**: hieuimba
**Data Pipeline**: https://github.com/hieuimba/Lichess-Spark-DataPipeline

## Tech Stack

This is a **pure frontend application** with no build process:

- **JavaScript**: Vanilla ES6 modules (no frameworks, no bundlers)
- **HTML/CSS**: Single-page application with manual DOM manipulation
- **External Libraries** (CDN-based):
  - [Lichess PGN Viewer](https://github.com/lichess-org/pgn-viewer) - Interactive chessboard
  - [Pico CSS](https://picocss.com/) - Minimal CSS framework
  - [Notyf](https://github.com/caroso1222/notyf) - Toast notifications
  - [HackTimer](https://github.com/turuslan/HackTimer) - Background-safe timers
- **Backend**: Azure Functions API for game data
- **Deployment**: GitHub Actions → itch.io

## Repository Structure

```
Guess-The-ELO/
├── index.html              # Main HTML file - single entry point
├── css/
│   └── styles.css         # All custom styles
├── js/
│   ├── home.js            # Home screen logic & game options
│   ├── game.js            # Core game loop & state management
│   ├── elements/
│   │   ├── chessBoard.js  # Lichess PGN viewer integration
│   │   ├── clock.js       # Countdown timer logic
│   │   └── modal.js       # Modal dialogs (How to Play, Credits, etc.)
│   ├── data/
│   │   └── fetchGames.js  # API calls to Azure Functions backend
│   └── other/
│       ├── config.js      # Configuration constants & text responses
│       ├── utils.js       # Utility functions (random, shuffle, etc.)
│       └── resize.js      # Responsive layout adjustments
├── images/
│   ├── icons/             # UI icons (hearts, fire, music toggle)
│   ├── mini-pieces/       # Chess piece SVGs
│   ├── annotate-icons/    # Chess annotation symbols
│   └── background-pc.png  # Main background image
├── sounds/
│   ├── music.mp3          # Background music
│   └── effects/           # Game sound effects
├── .github/workflows/
│   └── deploy-to-itch.yml # CI/CD pipeline
└── README.md              # Public-facing documentation
```

## Architecture & Code Organization

### Module System

All JavaScript files use **ES6 modules** with explicit imports/exports:

```javascript
// Importing
import { gameConfigs } from "./home.js";
import { fetchGames } from "./data/fetchGames.js";

// Exporting
export let gameConfigs = processSelections(optionSelections);
export async function fetchGames(timeControl, rounds) { ... }
```

### State Management

**Global state** is managed in `game.js`:

```javascript
let gameArray = [];          // Fetched chess games
let gameScore = 0;           // Current score
let streakCount = 0;         // Consecutive correct guesses
let correctElo = 0;          // Current round's correct answer
let currentRound = 0;        // Round counter
let livesCount = 3;          // Lives in Endless mode
let maxRounds = 0;           // Total rounds (5, 10, or 300 for Endless)
let gameTimeLimit = "";      // "None", "90s", or "45s"
let gameEvaluation = "";     // "Yes" or "No" (show eval bar)
let roundEnded = false;      // Round state flag
```

### Screen Flow

The app has **three main screens** controlled via `display: none/block`:

1. **Home Screen** (`#homeScreen`) - Game mode selection & options
2. **Game Screen** (`#gameScreen`) - Active gameplay with chessboard
3. **Result Screen** (`#resultScreen`) - End-of-game summary

Transitions:
```
Home → Game (singlePlayerStartButton click)
Game → Result (viewResultButton click)
Result → Home (mainMenuButton click)
```

## Key Files & Responsibilities

### `index.html`
- Single HTML file containing all markup
- Three main screen containers: `#homeScreen`, `#gameScreen`, `#resultScreen`
- Loads all external libraries via CDN
- Includes Google Analytics
- All scripts loaded as `type="module"` with `defer`

### `js/home.js`
- **Game configuration UI**: Handles option selection (rounds, time limit, evaluation, time control)
- **Wheel event handlers**: Allows scrolling through options
- **Music & fullscreen toggles**: Settings in header
- **Exports**: `gameConfigs`, `enableSelectionWheelEvents()`, `disableSelectionWheelEvents()`

### `js/game.js`
- **Core game loop**: `newGame()`, `endRound()`, `nextGame()`
- **Scoring logic**: Base score (1000) + time bonus + streak bonus
- **Lives system**: Heart icons for Endless mode
- **Answer validation**: ELO button click handlers
- **Result screen**: Score animations and summary
- **Exports**: `endRound()`, `removeHeart()`, `updateAnswerBannerElement()`

### `js/elements/chessBoard.js`
- Integrates Lichess PGN Viewer library
- `initializeChessBoard(moves, orientation, evaluation, site)` - Creates board
- `removeChessBoard()` - Cleanup between rounds
- Handles board size adjustments for responsive design

### `js/elements/clock.js`
- `startCountdown(seconds)` - Begins round timer
- `clearCountdown()` - Stops timer
- Visual countdown bar animation
- Calls `endRound("Time")` when time expires
- Plays countdown sound effect in last 10 seconds

### `js/data/fetchGames.js`
- `fetchGames(timeControl, rounds)` - Fetches games from Azure Functions API
- API Endpoint: `https://funcapp-guess-the-elo-dev.azurewebsites.net/api/games`
- Query params: `?event={timeControl}&limit={rounds}`
- Returns array of game objects with: `Moves`, `WhiteElo`, `BlackElo`, `Event`, `TimeControl`, `Site`

### `js/other/config.js`
- **API URL**: `gamesURL` constant
- **Text responses**: Arrays of random messages for correct/incorrect/timeout
- **Result headers**: Messages based on performance
- **Streak icon HTML**: Fire emoji for streaks

### `js/other/utils.js`
- `getRandomElement(array)` - Random selection helper
- `getRandomEloNumbers(correctElo)` - Generates 4 ELO choices with controlled difficulty
- `shuffleArray(array)` - Fisher-Yates shuffle
- `processSelections(selections)` - Converts UI selections to game config

### `css/styles.css`
- **CSS Variables**: Colors defined in `:root` (--primary-color, --secondary-color, etc.)
- **Responsive design**: Heavy use of `clamp()` for fluid typography/spacing
- **Custom classes**: `.correctGuess`, `.incorrectGuess`, `.streak`, `.pulse`, `.shrink`
- **Pico CSS overrides**: Customizations on top of Pico base styles

## Development Workflow

### No Build Process
- Direct file editing - changes are immediately reflected
- No transpilation, no bundling, no minification
- Use browser's native ES6 module system
- Test locally with any static file server (e.g., `python -m http.server`)

### Local Development
```bash
# Serve locally (any static server works)
python -m http.server 8000
# or
npx serve .

# Open browser to http://localhost:8000
```

### Making Changes

**Adding a new game option:**
1. Update option arrays in `home.js` (e.g., `roundsOptions`, `timeControlOptions`)
2. Add UI elements in `index.html`
3. Update `processSelections()` in `utils.js` if needed
4. Handle new config value in `game.js` logic

**Modifying scoring:**
1. Edit scoring constants in `game.js` → `endRound()` function
2. Scoring formula: `correctScore + timeBonus + streakBonus`
3. Time bonus: 0-500 points (or 0-1000 for 45s mode)
4. Streak bonus: `streakCount * 100` (starts at 3+ streak)

**Adding sound effects:**
1. Add audio file to `sounds/effects/`
2. Add `<audio>` tag in `index.html` with unique ID
3. Call `playSound(elementId)` in `game.js` at appropriate event

**Changing API endpoint:**
1. Update `gamesURL` in `js/other/config.js`
2. Ensure response format matches expected structure (array of game objects)

### External API Contract

**Expected game object structure:**
```json
{
  "Moves": "1. e4 e5 2. Nf3 ...",  // PGN moves
  "WhiteElo": "1847",               // String representation
  "BlackElo": "1823",
  "Event": "Rated Blitz game",
  "TimeControl": "180+0",
  "Site": "https://lichess.org/abc123"
}
```

## Deployment

### GitHub Actions Workflow
Located in `.github/workflows/deploy-to-itch.yml`:

1. **Trigger**: Push to `main` branch or manual dispatch
2. **Build**: Zips entire repository (excluding `.git`)
3. **Deploy**: Uses Butler CLI to push to itch.io
4. **Target**: `hieuimba/guess-the-elo:html5`

### Deployment Steps
```bash
# 1. Commit changes
git add .
git commit -m "Description of changes"

# 2. Push to main branch
git push origin main

# 3. GitHub Actions automatically deploys to itch.io
```

### Environment Variables
- `BUTLER_API_KEY`: Stored in GitHub Secrets as `BUTLER_CREDENTIALS`

## Code Conventions

### Naming Conventions
- **Variables**: camelCase (`gameScore`, `correctElo`)
- **Constants**: camelCase for arrays, UPPER_CASE for URLs (`roundsOptions`, `gamesURL`)
- **Functions**: camelCase, descriptive verbs (`updateScoreElement`, `setUpEloButtons`)
- **DOM IDs**: camelCase (`#singlePlayerButton`, `#eloButtonsContainer`)
- **CSS classes**: kebab-case (`.elo-button`, `.answer-banner`)

### Function Organization
- **Event handlers**: Named functions stored in variables when removal needed
  ```javascript
  eloButtonHandlers[button.id] = () => { eloButtonClickHandler(button, correctElo) };
  button.addEventListener("click", eloButtonHandlers[button.id]);
  ```
- **Async functions**: Always use `async/await`, no raw promises
- **Error handling**: Console errors for fetch failures

### DOM Manipulation Patterns
- **Element selection**: Store in constants at file top when reused
  ```javascript
  const singlePlayerButton = document.getElementById("singlePlayerButton");
  ```
- **Display toggling**: Direct `style.display = "none"` / `"block"` / `"flex"`
- **Class manipulation**: Use `classList.add()`, `classList.remove()`, `classList.toggle()`
- **Content updates**: Use `textContent` for text, `innerHTML` for HTML (sanitized)

### Audio Handling
- **Sound playback pattern**:
  ```javascript
  function playSound(elementId) {
    const audio = document.getElementById(elementId);
    audio.currentTime = 0;  // Rewind to start
    audio.play();
  }
  ```
- **Background music**: Volume set to 0.7, looped
- **Countdown sound**: Paused and reset when round ends early

### Animation Patterns
- **Score animations**: Custom easing with `setInterval`
  ```javascript
  animateScore(elementId, startValue, endValue, duration, callback)
  ```
- **CSS transitions**: Defined in styles.css, triggered by class changes
- **Pulse effect**: `.pulse` class for heart icons
- **Shrink effect**: `.shrink` class for removing lives

## Common Tasks for AI Assistants

### Task: Add a New Response Message
**Files to modify**: `js/other/config.js`

```javascript
// Add to appropriate array:
export const correctGuessResponse = [
  "Correct!",
  "Your new message here!",  // ← Add here
  // ...
];
```

### Task: Modify Time Bonus Calculation
**File to modify**: `js/game.js` → `endRound()` function

```javascript
// Current formula (lines 304-316):
if (gameTimeLimit === "90s") {
  timeBonus = Math.round(500 * remainingTimePercentage);
} else if (gameTimeLimit === "45s") {
  timeBonus = Math.round(500 * remainingTimePercentage) * 2;
} else {
  timeBonus = 0;
}
```

### Task: Add a New Time Control Option
**Files to modify**:
1. `js/home.js`: Add to `timeControlOptions` array
2. Backend API must support the new time control filter

### Task: Change ELO Difficulty Spread
**File to modify**: `js/other/utils.js` → `getRandomEloNumbers()`

```javascript
// Default parameters control difficulty:
function getRandomEloNumbers(
  correctElo,
  eloMin = 200,      // Lower bound
  eloMax = 3500,     // Upper bound
  diffMin = 300,     // Min difference between options
  diffMax = 600      // Max difference between options
)
```

### Task: Modify Lives System
**File to modify**: `js/game.js`

- **Starting lives**: Change `livesCount = 3` initialization
- **Lives gain rate**: Modify `if (partialLivesCount % 3 === 0)` in `addHeart()`
- **Max lives**: Change condition `if (maxRounds > 10 && livesCount < 5)`

### Task: Update API Endpoint
**File to modify**: `js/other/config.js`

```javascript
export const gamesURL = "https://your-new-endpoint.com/api/games";
```

### Task: Add Google Analytics Event
**File to modify**: `index.html` or relevant `.js` file

```javascript
gtag('event', 'your_event_name', {
  'event_category': 'category',
  'event_label': 'label'
});
```

## Important Constraints & Gotchas

### No Build Tools
- **Cannot use**: npm packages that require compilation (TypeScript, JSX, etc.)
- **Can use**: Any library available via CDN with UMD/ES6 exports
- **Asset paths**: Always relative to `index.html` root

### Lichess PGN Viewer Integration
- **Rendering target**: `#boardContainer` first child div
- **Cleanup required**: Call `removeChessBoard()` before creating new board
- **External link**: "View on Lichess" link must be disabled during active round
  - Controlled via `roundEnded` flag in `game.js` (lines 605-637)
- **Responsive sizing**: Board size adjusted in `chessBoard.js` based on viewport

### State Management
- **No state library**: All state is global variables in `game.js`
- **Reset pattern**: `resetVariables()` called at game start
- **State persistence**: None - refresh loses all progress
- **Event listener cleanup**: Remove listeners to prevent duplicates

### Browser Compatibility
- **ES6 modules**: Required - no IE11 support
- **Dynamic viewport height**: Uses `dvh` units (modern browsers)
- **Fullscreen API**: May not work on iOS Safari
- **Audio autoplay**: Requires user interaction (music toggle button)

### Performance Considerations
- **Game fetching**: Batches of 20 games fetched in Endless mode
  - Initial fetch: `maxRounds` games
  - Subsequent fetches: Every 20 rounds (line 119-121 in `game.js`)
- **DOM updates**: Minimal - only update changed elements
- **Animation timing**: Uses `setInterval` with 20ms precision
- **Background timers**: HackTimer prevents throttling when tab inactive

### Security & Content Policy
- **External content**: All chess games from trusted Lichess source
- **XSS prevention**: Use `textContent` by default, only `innerHTML` for trusted content
- **CORS**: API must have CORS enabled for browser requests
- **CSP**: None currently - add if needed for production hardening

## Testing Checklist

When making changes, test these scenarios:

### Game Flow
- [ ] Home screen loads with all options visible
- [ ] Game starts correctly for all round options (5, 10, Endless)
- [ ] Timer countdown works (90s, 45s, None options)
- [ ] Correct answer gives points and updates score
- [ ] Incorrect answer shows correct answer and doesn't give points
- [ ] Streak bonus activates at 3+ correct answers
- [ ] Next game button appears after answer
- [ ] Result screen shows at game end
- [ ] Main menu button returns to home

### Endless Mode
- [ ] Starts with 3 lives (hearts)
- [ ] Correct answer adds partial life progress
- [ ] 3 correct answers add 1 full life
- [ ] Max 5 lives enforced
- [ ] Incorrect answer removes 1 life
- [ ] Game ends when lives reach 0
- [ ] Games fetch in batches of 20

### UI/UX
- [ ] All buttons respond to clicks
- [ ] Mouse wheel scrolls through options
- [ ] Music toggle works
- [ ] Fullscreen toggle works
- [ ] Modals open and close correctly
- [ ] Responsive layout on mobile/tablet/desktop
- [ ] Chessboard scales appropriately
- [ ] Sound effects play at correct times

### Edge Cases
- [ ] API failure handled gracefully
- [ ] Rapid clicking doesn't break state
- [ ] Timer accuracy under tab switching
- [ ] "View on Lichess" link disabled during round
- [ ] Score animation doesn't skip values
- [ ] Heart animations complete before next round

## External Resources

### Documentation
- [Lichess PGN Viewer Docs](https://github.com/lichess-org/pgn-viewer)
- [Pico CSS Docs](https://picocss.com/docs)
- [Notyf Docs](https://github.com/caroso1222/notyf)

### Data Sources
- [Lichess Database](https://database.lichess.org) - Monthly chess game dumps
- [Data Pipeline](https://github.com/hieuimba/Lichess-Spark-DataPipeline) - Game extraction

### Deployment
- [Butler (itch.io CLI)](https://itch.io/docs/butler/) - Deployment tool
- [GitHub Actions Docs](https://docs.github.com/en/actions)

## Contact & Contribution

- **Author**: hieuimba
- **Email**: hieuimba@gmail.com
- **GitHub**: https://github.com/hieuimba
- **Issues**: Email for bugs/feedback

---

**Last Updated**: December 2024
**AI Assistant Note**: This documentation is specifically designed to help AI assistants understand the codebase structure and make informed modifications. When making changes, always consider the pure frontend nature of this project and the lack of a build process.
