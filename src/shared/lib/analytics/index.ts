import posthog from 'posthog-js';
import type {
  PageViewEvent,
  TournamentCreatedEvent,
  ParticipantAddedEvent,
  RoundGeneratedEvent,
  MatchResultEnteredEvent,
  RoundCompletedEvent,
  TournamentFinishedEvent,
  ShareClickedEvent,
  ShareLinkCopiedEvent,
  TournamentViewedEvent,
  StandingsViewedEvent,
  SupportClickedEvent,
  PremiumFeatureViewedEvent,
} from './types';

const ANON_USER_ID_KEY = 'anon_user_id';
const SESSION_ID_KEY = 'session_id';

/**
 * Generate or retrieve anonymous user ID from localStorage
 * This persists across browser sessions for retention tracking
 */
export function getOrCreateUserId(): string {
  try {
    let userId = localStorage.getItem(ANON_USER_ID_KEY);

    if (!userId) {
      userId = `anon_${crypto.randomUUID()}`;
      localStorage.setItem(ANON_USER_ID_KEY, userId);
    }

    return userId;
  } catch (error) {
    // Fallback if localStorage unavailable
    console.warn('Analytics: localStorage unavailable, using session-only ID');
    return `anon_${crypto.randomUUID()}`;
  }
}

/**
 * Generate or retrieve session ID from sessionStorage
 * This is unique per browser tab/session
 */
export function getSessionId(): string {
  try {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    return sessionId;
  } catch (error) {
    // Fallback if sessionStorage unavailable
    console.warn('Analytics: sessionStorage unavailable, generating temporary session ID');
    return crypto.randomUUID();
  }
}

/**
 * Initialize PostHog analytics
 * Call this once when app starts
 */
export function initializeAnalytics(): void {
  const apiKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  const apiHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

  if (!apiKey || !apiHost) {
    console.warn('Analytics: PostHog credentials not found. Analytics disabled.');
    return;
  }

  try {
    posthog.init(apiKey, {
      api_host: apiHost,
      autocapture: false, // Explicit control over events
      capture_pageview: false, // Manual page view tracking
      debug: import.meta.env.DEV, // Enable debug logs in development
      persistence: 'localStorage', // Use localStorage for persistence
    });

    // Identify anonymous user
    const userId = getOrCreateUserId();
    posthog.identify(userId, {
      is_anonymous: true,
      first_seen: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Analytics: Failed to initialize PostHog', error);
  }
}

/**
 * Safe event tracking with error handling
 */
function trackEvent(eventName: string, properties: object): void {
  try {
    // Add session_id if not already present
    const enrichedProperties = {
      ...properties,
      session_id: (properties as Record<string, unknown>).session_id || getSessionId(),
    };

    posthog.capture(eventName, enrichedProperties);
  } catch (error) {
    console.error(`Analytics: Failed to track event ${eventName}`, error);
  }
}

// ====================
// Public API
// ====================

export const analytics = {
  /**
   * Track page view
   */
  pageView: (path: string): void => {
    const properties: PageViewEvent = {
      path,
      referrer: document.referrer,
      session_id: getSessionId(),
    };
    trackEvent('page_view', properties);
  },

  /**
   * Track tournament creation
   */
  tournamentCreated: (params: Omit<TournamentCreatedEvent, 'session_id'>): void => {
    trackEvent('tournament_created', params);
  },

  /**
   * Track participant added
   */
  participantAdded: (params: Omit<ParticipantAddedEvent, 'session_id'>): void => {
    trackEvent('participant_added', params);
  },

  /**
   * Track round generation
   */
  roundGenerated: (params: Omit<RoundGeneratedEvent, 'session_id'>): void => {
    trackEvent('round_generated', params);
  },

  /**
   * Track match result entry
   */
  matchResultEntered: (params: Omit<MatchResultEnteredEvent, 'session_id'>): void => {
    trackEvent('match_result_entered', params);
  },

  /**
   * Track round completion
   */
  roundCompleted: (params: Omit<RoundCompletedEvent, 'session_id'>): void => {
    trackEvent('round_completed', params);
  },

  /**
   * Track tournament finish
   */
  tournamentFinished: (params: Omit<TournamentFinishedEvent, 'session_id'>): void => {
    trackEvent('tournament_finished', params);
  },

  /**
   * Track share button click
   */
  shareClicked: (params: Omit<ShareClickedEvent, 'session_id'>): void => {
    trackEvent('share_clicked', params);
  },

  /**
   * Track share link copied
   */
  shareLinkCopied: (params: Omit<ShareLinkCopiedEvent, 'session_id'>): void => {
    trackEvent('share_link_copied', params);
  },

  /**
   * Track tournament view (non-creator)
   */
  tournamentViewed: (params: Omit<TournamentViewedEvent, 'session_id'>): void => {
    trackEvent('tournament_viewed', params);
  },

  /**
   * Track standings view
   */
  standingsViewed: (params: Omit<StandingsViewedEvent, 'session_id'>): void => {
    trackEvent('standings_viewed', params);
  },

  /**
   * Track support button click (monetization signal)
   */
  supportClicked: (params: Omit<SupportClickedEvent, 'session_id'>): void => {
    trackEvent('support_clicked', params);
  },

  /**
   * Track premium feature view
   */
  premiumFeatureViewed: (params: Omit<PremiumFeatureViewedEvent, 'session_id'>): void => {
    trackEvent('premium_feature_viewed', params);
  },
};

// Export PostHog instance for advanced use cases
export { posthog };

