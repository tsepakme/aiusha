// PostHog Event Types
export interface PageViewEvent {
  path: string;
  referrer: string;
  session_id: string;
}

export interface TournamentCreatedEvent {
  tournament_id: string;
  system_type: 'swiss' | 'round-robin' | 'single-elimination' | 'double-elimination';
  participant_count: number;
  session_id: string;
}

export interface ParticipantAddedEvent {
  tournament_id: string;
  participant_count: number;
  method: 'manual' | 'bulk';
  session_id: string;
}

export interface RoundGeneratedEvent {
  tournament_id: string;
  round_number: number;
  system_type: string;
  session_id: string;
}

export interface MatchResultEnteredEvent {
  tournament_id: string;
  round_number: number;
  match_id: string;
  session_id: string;
}

export interface RoundCompletedEvent {
  tournament_id: string;
  round_number: number;
  time_to_complete_sec: number;
  session_id: string;
}

export interface TournamentFinishedEvent {
  tournament_id: string;
  total_rounds: number;
  total_participants: number;
  duration_sec: number;
  session_id: string;
}

export interface ShareClickedEvent {
  tournament_id: string;
  share_method: 'link' | 'social';
  session_id: string;
}

export interface ShareLinkCopiedEvent {
  tournament_id: string;
  session_id: string;
}

export interface TournamentViewedEvent {
  tournament_id: string;
  is_creator: boolean;
  session_id: string;
}

export interface StandingsViewedEvent {
  tournament_id: string;
  round_number: number;
  session_id: string;
}

// Union type for all events
export type AnalyticsEvent =
  | { event: 'page_view'; properties: PageViewEvent }
  | { event: 'tournament_created'; properties: TournamentCreatedEvent }
  | { event: 'participant_added'; properties: ParticipantAddedEvent }
  | { event: 'round_generated'; properties: RoundGeneratedEvent }
  | { event: 'match_result_entered'; properties: MatchResultEnteredEvent }
  | { event: 'round_completed'; properties: RoundCompletedEvent }
  | { event: 'tournament_finished'; properties: TournamentFinishedEvent }
  | { event: 'share_clicked'; properties: ShareClickedEvent }
  | { event: 'share_link_copied'; properties: ShareLinkCopiedEvent }
  | { event: 'tournament_viewed'; properties: TournamentViewedEvent }
  | { event: 'standings_viewed'; properties: StandingsViewedEvent };
