import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlsComponent } from '../../components/controls/controls.component';
import { FootballApiService } from '../../services/football-api.service';
import { LeagueStanding, PlayerStats } from '../../interfaces/statistics.interface';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  // Pestaña activa
  activeTab: 'standings' | 'players' = 'standings';
  
  // Datos para filtrado
  selectedLeague = '262'; // Liga MX por defecto
  selectedSeason = '2025'; // Temporada actual por defecto
  
  // Datos de ligas
  leagues = [
    { id: '262', name: 'Liga MX', country: 'México', logo: 'https://media-4.api-sports.io/football/leagues/262.png' },
    { id: '39', name: 'Premier League', country: 'Inglaterra', logo: 'https://media-4.api-sports.io/football/leagues/39.png' },
    { id: '140', name: 'La Liga', country: 'España', logo: 'https://media-4.api-sports.io/football/leagues/140.png' },
    { id: '61', name: 'Ligue 1', country: 'Francia', logo: 'https://media-4.api-sports.io/football/leagues/61.png' },
    { id: '78', name: 'Bundesliga', country: 'Alemania', logo: 'https://media-4.api-sports.io/football/leagues/78.png' },
    { id: '135', name: 'Serie A', country: 'Italia', logo: 'https://media-4.api-sports.io/football/leagues/135.png' }
  ];
  
  seasons = ['2025', '2024', '2023', '2022'];
  
  // Datos para mostrar
  standings: LeagueStanding[] = [];
  topScorers: PlayerStats[] = [];
  topAssists: PlayerStats[] = [];
  
  loading = true;
  
  constructor(private footballApiService: FootballApiService) {}
  
  ngOnInit(): void {
    this.loadLeagueStatistics();
  }
  
  loadLeagueStatistics(): void {
    this.loading = true;
    
    // En un caso real, cargaríamos los datos desde la API
    setTimeout(() => {
      this.loadExampleData();
      this.loading = false;
    }, 1000);
  }
  
  setActiveTab(tab: 'standings' | 'players'): void {
    this.activeTab = tab;
  }
  
  onLeagueChange(): void {
    this.loadLeagueStatistics();
  }
  
  onSeasonChange(): void {
    this.loadLeagueStatistics();
  }
  
  private loadExampleData(): void {
    // Estos son datos de ejemplo. En un caso real, obtendríamos estos datos de la API
    
    // Clasificación de ejemplo
    this.standings = [
      {
        position: 1,
        team: {
          id: 2302,
          name: 'América',
          logo: 'https://media-4.api-sports.io/football/teams/2302.png'
        },
        points: 36,
        played: 16,
        win: 11,
        draw: 3,
        lose: 2,
        goalsFor: 30,
        goalsAgainst: 12,
        goalsDiff: 18
      },
      {
        position: 2,
        team: {
          id: 2287,
          name: 'Monterrey',
          logo: 'https://media-4.api-sports.io/football/teams/2287.png'
        },
        points: 33,
        played: 16,
        win: 10,
        draw: 3,
        lose: 3,
        goalsFor: 28,
        goalsAgainst: 15,
        goalsDiff: 13
      },
      {
        position: 3,
        team: {
          id: 2295,
          name: 'Tigres',
          logo: 'https://media-4.api-sports.io/football/teams/2295.png'
        },
        points: 31,
        played: 16,
        win: 9,
        draw: 4,
        lose: 3,
        goalsFor: 26,
        goalsAgainst: 14,
        goalsDiff: 12
      },
      {
        position: 4,
        team: {
          id: 2285,
          name: 'Cruz Azul',
          logo: 'https://media-4.api-sports.io/football/teams/2285.png'
        },
        points: 28,
        played: 16,
        win: 8,
        draw: 4,
        lose: 4,
        goalsFor: 23,
        goalsAgainst: 16,
        goalsDiff: 7
      },
      {
        position: 5,
        team: {
          id: 2292,
          name: 'Pumas',
          logo: 'https://media-4.api-sports.io/football/teams/2292.png'
        },
        points: 24,
        played: 16,
        win: 7,
        draw: 3,
        lose: 6,
        goalsFor: 19,
        goalsAgainst: 18,
        goalsDiff: 1
      },
      {
        position: 6,
        team: {
          id: 2288,
          name: 'Pachuca',
          logo: 'https://media-4.api-sports.io/football/teams/2288.png'
        },
        points: 22,
        played: 16,
        win: 6,
        draw: 4,
        lose: 6,
        goalsFor: 20,
        goalsAgainst: 19,
        goalsDiff: 1
      },
      {
        position: 7,
        team: {
          id: 2297,
          name: 'Toluca',
          logo: 'https://media-4.api-sports.io/football/teams/2297.png'
        },
        points: 21,
        played: 16,
        win: 6,
        draw: 3,
        lose: 7,
        goalsFor: 22,
        goalsAgainst: 24,
        goalsDiff: -2
      },
      {
        position: 8,
        team: {
          id: 2282,
          name: 'Atlas',
          logo: 'https://media-4.api-sports.io/football/teams/2282.png'
        },
        points: 20,
        played: 16,
        win: 5,
        draw: 5,
        lose: 6,
        goalsFor: 17,
        goalsAgainst: 18,
        goalsDiff: -1
      },
      {
        position: 9,
        team: {
          id: 2287,
          name: 'Chivas',
          logo: 'https://media-4.api-sports.io/football/teams/2287.png'
        },
        points: 19,
        played: 16,
        win: 5,
        draw: 4,
        lose: 7,
        goalsFor: 17,
        goalsAgainst: 20,
        goalsDiff: -3
      },
      {
        position: 10,
        team: {
          id: 2289,
          name: 'Puebla',
          logo: 'https://media-4.api-sports.io/football/teams/2289.png'
        },
        points: 18,
        played: 16,
        win: 5,
        draw: 3,
        lose: 8,
        goalsFor: 15,
        goalsAgainst: 22,
        goalsDiff: -7
      }
    ];
    
    // Goleadores de ejemplo
    this.topScorers = [
      {
        player: {
          id: 46733,
          name: 'Julián Quiñones',
          photo: 'https://media-4.api-sports.io/football/players/46733.png',
          nationality: 'Colombia',
          position: 'Delantero'
        },
        team: {
          id: 2302,
          name: 'América',
          logo: 'https://media-4.api-sports.io/football/teams/2302.png'
        },
        goals: 12,
        assists: 5,
        yellowCards: 2,
        redCards: 0,
        appearances: 16
      },
      {
        player: {
          id: 46555,
          name: 'André-Pierre Gignac',
          photo: 'https://media-4.api-sports.io/football/players/46555.png',
          nationality: 'Francia',
          position: 'Delantero'
        },
        team: {
          id: 2295,
          name: 'Tigres',
          logo: 'https://media-4.api-sports.io/football/teams/2295.png'
        },
        goals: 10,
        assists: 3,
        yellowCards: 1,
        redCards: 0,
        appearances: 15
      },
      {
        player: {
          id: 46622,
          name: 'Rogelio Funes Mori',
          photo: 'https://media-4.api-sports.io/football/players/46622.png',
          nationality: 'Argentina',
          position: 'Delantero'
        },
        team: {
          id: 2287,
          name: 'Monterrey',
          logo: 'https://media-4.api-sports.io/football/teams/2287.png'
        },
        goals: 9,
        assists: 2,
        yellowCards: 3,
        redCards: 0,
        appearances: 14
      },
      {
        player: {
          id: 47300,
          name: 'Henry Martín',
          photo: 'https://media-4.api-sports.io/football/players/47300.png',
          nationality: 'México',
          position: 'Delantero'
        },
        team: {
          id: 2302,
          name: 'América',
          logo: 'https://media-4.api-sports.io/football/teams/2302.png'
        },
        goals: 8,
        assists: 4,
        yellowCards: 2,
        redCards: 0,
        appearances: 15
      },
      {
        player: {
          id: 47422,
          name: 'Gabriel Fernández',
          photo: 'https://media-4.api-sports.io/football/players/47422.png',
          nationality: 'Uruguay',
          position: 'Delantero'
        },
        team: {
          id: 2292,
          name: 'Pumas',
          logo: 'https://media-4.api-sports.io/football/teams/2292.png'
        },
        goals: 7,
        assists: 1,
        yellowCards: 4,
        redCards: 1,
        appearances: 16
      }
    ];
    
    // Asistidores de ejemplo
    this.topAssists = [
      {
        player: {
          id: 46712,
          name: 'Álvaro Fidalgo',
          photo: 'https://media-4.api-sports.io/football/players/46712.png',
          nationality: 'España',
          position: 'Centrocampista'
        },
        team: {
          id: 2302,
          name: 'América',
          logo: 'https://media-4.api-sports.io/football/teams/2302.png'
        },
        goals: 4,
        assists: 8,
        yellowCards: 5,
        redCards: 0,
        appearances: 16
      },
      {
        player: {
          id: 46785,
          name: 'Rodrigo Aguirre',
          photo: 'https://media-4.api-sports.io/football/players/46785.png',
          nationality: 'Uruguay',
          position: 'Delantero'
        },
        team: {
          id: 2287,
          name: 'Monterrey',
          logo: 'https://media-4.api-sports.io/football/teams/2287.png'
        },
        goals: 6,
        assists: 7,
        yellowCards: 2,
        redCards: 0,
        appearances: 15
      },
      {
        player: {
          id: 46733,
          name: 'Julián Quiñones',
          photo: 'https://media-4.api-sports.io/football/players/46733.png',
          nationality: 'Colombia',
          position: 'Delantero'
        },
        team: {
          id: 2302,
          name: 'América',
          logo: 'https://media-4.api-sports.io/football/teams/2302.png'
        },
        goals: 12,
        assists: 5,
        yellowCards: 2,
        redCards: 0,
        appearances: 16
      },
      {
        player: {
          id: 47345,
          name: 'Uriel Antuna',
          photo: 'https://media-4.api-sports.io/football/players/47345.png',
          nationality: 'México',
          position: 'Extremo'
        },
        team: {
          id: 2285,
          name: 'Cruz Azul',
          logo: 'https://media-4.api-sports.io/football/teams/2285.png'
        },
        goals: 5,
        assists: 5,
        yellowCards: 1,
        redCards: 0,
        appearances: 14
      },
      {
        player: {
          id: 47300,
          name: 'Henry Martín',
          photo: 'https://media-4.api-sports.io/football/players/47300.png',
          nationality: 'México',
          position: 'Delantero'
        },
        team: {
          id: 2302,
          name: 'América',
          logo: 'https://media-4.api-sports.io/football/teams/2302.png'
        },
        goals: 8,
        assists: 4,
        yellowCards: 2,
        redCards: 0,
        appearances: 15
      }
    ];
  }
}