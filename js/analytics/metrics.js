/**
 * Simple Analytics Tracker for Guess The ELO
 * Sends events to Google Analytics 4 for tracking user behavior
 */

export class SimpleTracker {
  constructor() {
    this.sessionStartTime = Date.now();
    this.roundStartTime = null;
    this.debug = false; // Set to true to see events in console
  }

  /**
   * Main tracking method
   * @param {string} category - Event category (game, ui, daily)
   * @param {string} action - Event action (start, complete, click, etc.)
   * @param {object} data - Additional event parameters
   */
  track(category, action, data = {}) {
    try {
      const event = {
        event_category: category,
        event_label: action,
        timestamp: Date.now(),
        session_duration: Math.floor((Date.now() - this.sessionStartTime) / 1000),
        ...data
      };

      // Send to GA4
      if (window.gtag) {
        // Use GA4 recommended event names where applicable
        let eventName = `${category}_${action}`;

        // Map to GA4 standard events when possible
        if (category === 'game' && action === 'start') {
          eventName = 'level_start';
          event.level_name = data.mode || 'unknown';
        } else if (category === 'game' && action === 'complete') {
          eventName = 'level_complete';
          event.level_name = data.mode || 'unknown';
          event.score = data.finalScore || 0;
          event.success = (data.correctCount > 0);
        } else if (action === 'share') {
          eventName = 'share';
          event.method = 'clipboard';
          event.content_type = 'game_result';
        }

        gtag('event', eventName, event);

        if (this.debug) {
          console.log('📊 GA4 Event:', eventName, event);
        }
      }
    } catch (err) {
      // Silently handle errors - don't break the game for analytics failures
      if (this.debug) {
        console.warn(`Failed to track ${category}/${action}:`, err);
      }
    }
  }

  // Convenience methods for common events

  trackGameStart(mode, options = {}) {
    try {
      this.roundStartTime = Date.now();
      this.track('game', 'start', {
        mode,
        time_limit: options.timeLimit || 'none',
        evaluation: options.evaluation || 'unknown',
        time_control: options.timeControl || 'any'
      });
    } catch (err) {
      if (this.debug) {
        console.warn('Failed in trackGameStart:', err);
      }
    }
  }

  trackRoundComplete(roundData) {
    try {
      const roundDuration = this.roundStartTime ?
        Math.floor((Date.now() - this.roundStartTime) / 1000) : 0;

      this.track('game', 'round_complete', {
        mode: roundData.mode,
        round: roundData.round,
        correct: roundData.correct,
        time_remaining: roundData.timeRemaining || 0,
        round_duration: roundDuration,
        elo_guessed: roundData.eloGuessed,
        elo_correct: roundData.eloCorrect,
        points_earned: roundData.pointsEarned || 0,
        streak: roundData.streak || 0
      });

      // Reset round timer for next round
      this.roundStartTime = Date.now();
    } catch (err) {
      if (this.debug) {
        console.warn('Failed in trackRoundComplete:', err);
      }
    }
  }

  trackGameComplete(gameData) {
    try {
      this.track('game', 'complete', {
        mode: gameData.mode,
        final_score: gameData.finalScore,
        rounds_played: gameData.roundsPlayed,
        correct_count: gameData.correctCount,
        longest_streak: gameData.longestStreak || 0,
        total_duration: Math.floor((Date.now() - this.sessionStartTime) / 1000)
      });
    } catch (err) {
      if (this.debug) {
        console.warn('Failed in trackGameComplete:', err);
      }
    }
  }

  trackGameAbandon(mode, currentRound) {
    this.track('game', 'abandon', {
      mode,
      round_abandoned: currentRound,
      session_duration: Math.floor((Date.now() - this.sessionStartTime) / 1000)
    });
  }

  trackButtonClick(buttonId, context = {}) {
    this.track('ui', 'button_click', {
      button_id: buttonId,
      ...context
    });
  }

  trackDailyChallenge(data) {
    this.track('daily', 'played', {
      challenge_number: data.challengeNumber,
      streak: data.streak,
      score: data.score,
      correct: data.correct,
      time_used: data.timeUsed
    });
  }

  enableDebug() {
    this.debug = true;
  }

  disableDebug() {
    this.debug = false;
  }
}

// Create singleton instance
export const tracker = new SimpleTracker();