// src/app/interfaces/statistics.interface.ts
export interface LeagueStanding {
  rank: number;
  teamId: number;
  teamName: string;
  teamLogo: string;
  points: number;
  goalsDiff: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface PlayerStat {
  playerId: number;
  name: string;
  photo: string;
  nationality: string;
  team: string;
  teamLogo: string;
  goals: number;
  assists: number;
}

export interface LeagueStatistics {
  leagueId: number;
  leagueName: string;
  leagueCountry: string;
  leagueLogo: string;
  season: number;
  standings: LeagueStanding[];
  topScorers: PlayerStat[];
  topAssisters: PlayerStat[];
  lastUpdated: Date;
}