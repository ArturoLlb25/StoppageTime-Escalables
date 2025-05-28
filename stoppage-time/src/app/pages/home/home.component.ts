// En src/app/pages/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatchCardComponent } from '../../components/match-card/match-card.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { FootballApiService } from '../../services/football-api.service';
import { NewsService } from '../../services/news.service';
import { Match } from '../../interfaces/match.interface';
import { News } from '../../interfaces/news.interface';
import { LeagueStanding } from '../../interfaces/statistics.interface';

interface LeagueTab {
  id: number;
  name: string;
  standings: LeagueStanding[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatchCardComponent,
    NewsCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  liveMatches: Match[] = [];
  featuredNews: News[] = [];
  
  // Datos para pestañas de estadísticas
  leagueTabs: LeagueTab[] = [];
  activeTabIndex = 0;
  
  // Estados de carga y error
  loadingMatches = true;
  loadingNews = true;
  errorMatches = false;
  
  constructor(
    private footballApiService: FootballApiService,
    private newsService: NewsService
  ) {}
  
  ngOnInit(): void {
    this.loadLiveMatches();
    this.loadFeaturedNews();
    this.loadStandings();
  }
  
  loadLiveMatches(): void {
    this.loadingMatches = true;
    this.errorMatches = false;
    
    this.footballApiService.getLiveMatches().subscribe({
      next: (matches) => {
        console.log('Partidos cargados en Home:', matches);
        // Filtrar y mostrar máximo 3 partidos (priorizando los que están en vivo)
        const liveOnes = matches.filter(match => match.status === 'LIVE');
        const scheduledOnes = matches.filter(match => match.status === 'SCHEDULED');
        const finishedOnes = matches.filter(match => match.status === 'FINISHED');
        
        // Combinar dando prioridad a los partidos en vivo
        let combinedMatches = [...liveOnes, ...scheduledOnes, ...finishedOnes];
        
        // Tomar solo los primeros 3
        this.liveMatches = combinedMatches.slice(0, 3);
        this.loadingMatches = false;
      },
      error: (error) => {
        console.error('Error al cargar partidos en Home:', error);
        this.loadingMatches = false;
        this.errorMatches = true;
        // Si hay error, cargar datos de ejemplo como fallback
        this.loadExampleMatches();
      }
    });
  }
  
  private loadFeaturedNews(): void {
    this.loadingNews = true;
    
    this.newsService.getFeaturedNews().subscribe(
      news => {
        console.log('Noticias destacadas recibidas en home:', news);
        // Verificar que cada noticia tiene un ID válido
        this.featuredNews = news.filter(item => item && item.id);
        
        // Si no hay noticias destacadas válidas, intentar cargar todas las noticias
        if (this.featuredNews.length === 0) {
          this.loadAllNews();
        }
        this.loadingNews = false;
      },
      error => {
        console.error('Error al cargar noticias destacadas:', error);
        this.featuredNews = [];
        this.loadingNews = false;
      }
    );
  }

  private loadAllNews(): void {
    this.newsService.getAllNews().subscribe(
      news => {
        console.log('Todas las noticias recibidas en home:', news);
        // Tomar las 3 primeras noticias si están disponibles
        this.featuredNews = news.slice(0, 3);
      },
      error => {
        console.error('Error al cargar todas las noticias:', error);
        this.featuredNews = [];
      }
    );
  }
  
  loadStandings(): void {
    // En un caso real, obtendríamos estos datos de la API
    // Para este ejemplo, cargamos datos de prueba
    this.loadExampleStandings();
  }
  
  setActiveTab(index: number): void {
    this.activeTabIndex = index;
  }
  
  // Este método solo se utiliza como fallback en caso de error
  private loadExampleMatches(): void {
    // Estos son datos de ejemplo que solo se mostrarán si hay un error al cargar desde la API
    this.liveMatches = [
      {
        id: 1,
        date: '2025-05-23',
        time: '20:00',
        status: 'LIVE',
        league: {
          id: 262,
          name: 'Liga MX',
          logo: 'https://media-4.api-sports.io/football/leagues/262.png',
          country: 'Mexico'
        },
        homeTeam: {
          id: 2302,
          name: 'América',
          logo: 'https://media-4.api-sports.io/football/teams/2302.png'
        },
        awayTeam: {
          id: 2287,
          name: 'Chivas',
          logo: 'https://media-4.api-sports.io/football/teams/2287.png'
        },
        score: {
          home: 2,
          away: 1
        }
      },
      {
        id: 2,
        date: '2025-05-23',
        time: '18:30',
        status: 'LIVE',
        league: {
          id: 39,
          name: 'Premier League',
          logo: 'https://media-4.api-sports.io/football/leagues/39.png',
          country: 'England'
        },
        homeTeam: {
          id: 40,
          name: 'Liverpool',
          logo: 'https://media-4.api-sports.io/football/teams/40.png'
        },
        awayTeam: {
          id: 33,
          name: 'Manchester United',
          logo: 'https://media-4.api-sports.io/football/teams/33.png'
        },
        score: {
          home: 3,
          away: 1
        }
      },
      {
        id: 3,
        date: '2025-05-23',
        time: '20:45',
        status: 'SCHEDULED',
        league: {
          id: 140,
          name: 'La Liga',
          logo: 'https://media-4.api-sports.io/football/leagues/140.png',
          country: 'Spain'
        },
        homeTeam: {
          id: 541,
          name: 'Real Madrid',
          logo: 'https://media-4.api-sports.io/football/teams/541.png'
        },
        awayTeam: {
          id: 529,
          name: 'Barcelona',
          logo: 'https://media-4.api-sports.io/football/teams/529.png'
        }
      }
    ];
  }
  
  private loadExampleStandings(): void {
    // Datos de ejemplo para las clasificaciones
    this.leagueTabs = [
      {
        id: 262,
        name: 'Liga MX',
        standings: [
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
          }
        ]
      },
      {
        id: 39,
        name: 'Premier League',
        standings: [
          {
            position: 1,
            team: {
              id: 50,
              name: 'Manchester City',
              logo: 'https://media-4.api-sports.io/football/teams/50.png'
            },
            points: 88,
            played: 37,
            win: 28,
            draw: 4,
            lose: 5,
            goalsFor: 92,
            goalsAgainst: 32,
            goalsDiff: 60
          },
          {
            position: 2,
            team: {
              id: 40,
              name: 'Liverpool',
              logo: 'https://media-4.api-sports.io/football/teams/40.png'
            },
            points: 85,
            played: 37,
            win: 26,
            draw: 7,
            lose: 4,
            goalsFor: 89,
            goalsAgainst: 35,
            goalsDiff: 54
          },
          {
            position: 3,
            team: {
              id: 42,
              name: 'Arsenal',
              logo: 'https://media-4.api-sports.io/football/teams/42.png'
            },
            points: 84,
            played: 37,
            win: 26,
            draw: 6,
            lose: 5,
            goalsFor: 85,
            goalsAgainst: 28,
            goalsDiff: 57
          },
          {
            position: 4,
            team: {
              id: 49,
              name: 'Chelsea',
              logo: 'https://media-4.api-sports.io/football/teams/49.png'
            },
            points: 71,
            played: 37,
            win: 21,
            draw: 8,
            lose: 8,
            goalsFor: 74,
            goalsAgainst: 45,
            goalsDiff: 29
          },
          {
            position: 5,
            team: {
              id: 47,
              name: 'Tottenham',
              logo: 'https://media-4.api-sports.io/football/teams/47.png'
            },
            points: 64,
            played: 37,
            win: 19,
            draw: 7,
            lose: 11,
            goalsFor: 67,
            goalsAgainst: 54,
            goalsDiff: 13
          }
        ]
      },
      {
        id: 140,
        name: 'La Liga',
        standings: [
          {
            position: 1,
            team: {
              id: 541,
              name: 'Real Madrid',
              logo: 'https://media-4.api-sports.io/football/teams/541.png'
            },
            points: 90,
            played: 36,
            win: 28,
            draw: 6,
            lose: 2,
            goalsFor: 78,
            goalsAgainst: 26,
            goalsDiff: 52
          },
          {
            position: 2,
            team: {
              id: 529,
              name: 'Barcelona',
              logo: 'https://media-4.api-sports.io/football/teams/529.png'
            },
            points: 82,
            played: 36,
            win: 25,
            draw: 7,
            lose: 4,
            goalsFor: 75,
            goalsAgainst: 37,
            goalsDiff: 38
          },
          {
            position: 3,
            team: {
              id: 530,
              name: 'Atlético Madrid',
              logo: 'https://media-4.api-sports.io/football/teams/530.png'
            },
            points: 73,
            played: 36,
            win: 22,
            draw: 7,
            lose: 7,
            goalsFor: 68,
            goalsAgainst: 35,
            goalsDiff: 33
          },
          {
            position: 4,
            team: {
              id: 548,
              name: 'Girona',
              logo: 'https://media-4.api-sports.io/football/teams/548.png'
            },
            points: 68,
            played: 36,
            win: 20,
            draw: 8,
            lose: 8,
            goalsFor: 69,
            goalsAgainst: 44,
            goalsDiff: 25
          },
          {
            position: 5,
            team: {
              id: 531,
              name: 'Athletic Club',
              logo: 'https://media-4.api-sports.io/football/teams/531.png'
            },
            points: 61,
            played: 36,
            win: 17,
            draw: 10,
            lose: 9,
            goalsFor: 56,
            goalsAgainst: 39,
            goalsDiff: 17
          }
        ]
      }
    ];
  }
}