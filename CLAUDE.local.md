# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Guess The ELO** is a browser-based chess quiz game where players guess the Elo rating of chess matches. The game is built as a static website using vanilla JavaScript (ES6 modules) with no build process or package manager.

- **Live Site**: https://guesstheelo.com
- **Tech Stack**: HTML, CSS, vanilla JavaScript (ES6 modules)
- **No build tools**: Files are served directly; no npm, webpack, or compilation needed
- **External Dependencies**: Loaded via CDN (Lichess PGN Viewer, Chess.js, Pico CSS, Notyf)

## Architecture

### Code Structure

- **`index.html`**: Single-page application entry point with all UI screens (home, game, result)
- **`js/home.js`**: Home screen, game mode selection, options (rounds, time control, evaluation, time limit)
- **`js/game.js`**: Core game loop, scoring, round management, lives/hearts system, button handlers
- **`js/data/fetchGames.js`**: Fetches chess games from Azure Functions backend API
- **`js/elements/`**: UI component modules
  - `chessBoard.js`: Lichess PGN Viewer integration, evaluation bar/field, piece advantage, move annotations
  - `clock.js`: Countdown timer functionality
  - `modal.js`: Modal dialogs (How To Play, Credits, Contact)
- **`js/other/`**: Utilities and configuration
  - `config.js`: API URL, response messages, game text constants
  - `utils.js`: Helper functions (random ELO generation, array shuffling, game config processing)
  - `resize.js`: Responsive layout adjustments

### Game Flow

1. **Home Screen** (`home.js`): User selects game mode and options → fetches initial batch of games
2. **Game Screen** (`game.js`):
   - Displays chess game via `chessBoard.js`
   - Shows 4 ELO options (1 correct, 3 random distractors)
   - Tracks score, streak, lives (Endless mode)
   - Timer countdown via `clock.js`
3. **Result Screen**: Score breakdown with animated counters

### Key Game Mechanics

- **Classic Mode**: Fixed rounds (5 or 10), maximize score
- **Endless Mode**: Start with 3 lives, earn extra life every 3 correct answers, survive as long as possible
- **Scoring**: Base 1000 points + time bonus (0-500, doubled for 45s mode) + streak bonus (100 × streak count when ≥3)
- **Game Fetching**: Initial batch fetched on start, additional 20 games fetched every 20 rounds in Endless mode

## Data Source

Games are fetched from an Azure Functions API endpoint defined in `js/other/config.js`. The backend is updated monthly with games from the Lichess database. See: https://github.com/hieuimba/Lichess-Spark-DataPipeline

## Development

### Running Locally

This is a static site with no build process. Use any local web server:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then navigate to `http://localhost:8000` (or appropriate port).

### File Organization

- **No module bundler**: All JavaScript files use ES6 `import`/`export` and are loaded as modules
- **Assets**:
  - `css/styles.css`: All styling
  - `images/`: Icons (heart, fire, annotate), mini-pieces, screenshots
  - `sounds/`: Background music and sound effects
- **Reference folder**: Not tracked in git (see `.gitignore`)

### Important Implementation Details

- **Chessboard Integration**: `chessBoard.js` uses Lichess PGN Viewer and Chess.js (both loaded via CDN). It:
  - Parses PGN moves and extracts evaluation data
  - Creates custom eval bar and eval field
  - Tracks captured pieces and material advantage
  - Displays move annotations (inaccuracy, mistake, blunder)
  - Uses MutationObserver to sync with board state changes

- **Option Selection**: `home.js` uses scroll wheel events on option fields for intuitive selection cycling

- **Async Game Loading**: Start button shows loading state (`aria-busy="true"`) while fetching games

- **View on Lichess Link**: `game.js` disables the Lichess link during active rounds, enables after round ends (prevents cheating)

## Testing

Manual testing only. Test across:
- Multiple browsers (Chrome, Firefox, Safari)
- Desktop and mobile viewports
- All game modes and option combinations
