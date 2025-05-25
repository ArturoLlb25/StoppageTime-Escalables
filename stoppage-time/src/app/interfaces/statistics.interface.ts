export interface LeagueStanding {
  position: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;
}

export interface PlayerStats {
  player: {
    id: number;
    name: string;
    photo: string;
    nationality: string;
    position: string;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  appearances: number;
}