export interface Team {
  id: number;
  name: string;
  logo: string;
}

export interface League {
  id: number;
  name: string;
  logo?: string;
  country?: string;/////////////////checarluego
}

export interface Match {
  id: number;
  date: string;
  time: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELED';
  round?: string;
  league: League;
  homeTeam: Team;
  awayTeam: Team;
  score?: {
    home: number;
    away: number;
    halftime?: {
      home: number;
      away: number;
    }
  };
}

export interface Goal {
  teamId: number;
  minute: number;
  player: string;
}

export interface Card {
  teamId: number;
  minute: number;
  player: string;
  type: 'yellow' | 'red';
}

export interface Substitution {
  teamId: number;
  minute: number;
  playerIn: string;
  playerOut: string;
}

export interface MatchEvent {
  type: 'goal' | 'card' | 'substitution';
  minute: number;
  detail: Goal | Card | Substitution;
}

export interface Player {
  id: number;
  name: string;
  position: string;
  number: number;
  isCaptain: boolean;
}