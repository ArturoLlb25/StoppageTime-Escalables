import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlsComponent } from '../../components/controls/controls.component';
import { MatchCardComponent } from '../../components/match-card/match-card.component';
import { FootballApiService } from '../../services/football-api.service';
import { Match } from '../../interfaces/match.interface';

interface League {
  id: number;
  name: string;
}

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ControlsComponent,
    MatchCardComponent
  ],
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css']
})
export class MatchesComponent implements OnInit {
  allMatches: Match[] = [];
  liveMatches: Match[] = [];
  todayMatches: Match[] = [];
  upcomingMatches: Match[] = [];
  finishedMatches: Match[] = [];
  
  loading = true;
  noMatchesFound = false;
  
  filterType = 'all';
  selectedLeague = 'all';
  searchQuery = '';
  
  leagues: League[] = [
    { id: 262, name: 'Liga MX' },
    { id: 39, name: 'Premier League' },
    { id: 140, name: 'La Liga' },
    { id: 61, name: 'Ligue 1' },
    { id: 78, name: 'Bundesliga' },
    { id: 135, name: 'Serie A' }
  ];
  
  // Paginación
  pageSize = 12;
  currentPage = 0;
  totalMatches = 0;
  totalPages = 1;
  
  constructor(private footballApiService: FootballApiService) {}
  
  ngOnInit(): void {
    this.loadMatches();
  }
  
  loadMatches(): void {
    this.loading = true;
    
    // En un caso real, obtendríamos estos datos de la API
    // Por ahora, usamos datos de ejemplo
    setTimeout(() => {
      this.loadExampleMatches();
      this.filterMatches();
      this.loading = false;
    }, 1000);
  }
  
  onSearch(query: string): void {
    this.searchQuery = query;
    this.currentPage = 0;
    this.filterMatches();
  }
  
  applyFilters(): void {
    this.currentPage = 0;
    this.filterMatches();
  }
  
  resetFilters(): void {
    this.filterType = 'all';
    this.selectedLeague = 'all';
    this.searchQuery = '';
    this.currentPage = 0;
    this.filterMatches();
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
    this.filterMatches();
  }
  
  filterMatches(): void {
    let filteredMatches = [...this.allMatches];
    
    // Filtrar por tipo
    if (this.filterType !== 'all') {
      switch (this.filterType) {
        case 'live':
          filteredMatches = filteredMatches.filter(match => match.status === 'LIVE');
          break;
        case 'today':
          filteredMatches = filteredMatches.filter(match => {
            const today = new Date().toISOString().split('T')[0];
            return match.date === today && match.status !== 'LIVE';
          });
          break;
        case 'upcoming':
          filteredMatches = filteredMatches.filter(match => match.status === 'SCHEDULED');
          break;
        case 'finished':
          filteredMatches = filteredMatches.filter(match => match.status === 'FINISHED');
          break;
      }
    }
    
    // Filtrar por liga
    if (this.selectedLeague !== 'all') {
      const leagueId = parseInt(this.selectedLeague);
      filteredMatches = filteredMatches.filter(match => match.league.id === leagueId);
    }
    
    // Filtrar por búsqueda
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredMatches = filteredMatches.filter(match => 
        match.homeTeam.name.toLowerCase().includes(query) || 
        match.awayTeam.name.toLowerCase().includes(query) || 
        match.league.name.toLowerCase().includes(query)
      );
    }
    
    // Actualizar total
    this.totalMatches = filteredMatches.length;
    this.totalPages = Math.ceil(this.totalMatches / this.pageSize);
    
    // Verificar si hay resultados
    this.noMatchesFound = filteredMatches.length === 0;
    
    // Dividir por tipo para mostrar en secciones
    this.liveMatches = filteredMatches.filter(match => match.status === 'LIVE');
    
    this.todayMatches = filteredMatches.filter(match => {
      const today = new Date().toISOString().split('T')[0];
      return match.date === today && match.status !== 'LIVE' && match.status !== 'FINISHED';
    });
    
    this.upcomingMatches = filteredMatches.filter(match => {
      const today = new Date().toISOString().split('T')[0];
      return (match.date > today || match.status === 'SCHEDULED') && match.status !== 'LIVE';
    });
    
    this.finishedMatches = filteredMatches.filter(match => match.status === 'FINISHED');
    
    // Paginación (en un caso real, se haría en el backend)
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    
    if (this.filterType === 'all') {
      this.liveMatches = this.liveMatches.slice(0, Math.min(this.liveMatches.length, end));
      this.todayMatches = this.todayMatches.slice(0, Math.min(this.todayMatches.length, end - this.liveMatches.length));
      this.upcomingMatches = this.upcomingMatches.slice(0, Math.min(this.upcomingMatches.length, end - this.liveMatches.length - this.todayMatches.length));
      this.finishedMatches = this.finishedMatches.slice(0, Math.min(this.finishedMatches.length, end - this.liveMatches.length - this.todayMatches.length - this.upcomingMatches.length));
    } else {
      // Si se está filtrando por un tipo específico, aplicar paginación a esa sección
      switch (this.filterType) {
        case 'live':
          this.liveMatches = this.liveMatches.slice(start, end);
          break;
          case 'today':
          this.todayMatches = this.todayMatches.slice(start, end);
          break;
        case 'upcoming':
          this.upcomingMatches = this.upcomingMatches.slice(start, end);
          break;
        case 'finished':
          this.finishedMatches = this.finishedMatches.slice(start, end);
          break;
      }
    }
  }
  
  private loadExampleMatches(): void {
    // Datos de ejemplo - En un caso real, estos vendrían de la API
    this.allMatches = [
      // Partidos en vivo
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
      
      // Partidos programados para hoy
      {
        id: 3,
        date: '2025-05-23',
        time: '21:00',
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
      },
      {
        id: 4,
        date: '2025-05-23',
        time: '22:00',
        status: 'SCHEDULED',
        league: {
          id: 61,
          name: 'Ligue 1',
          logo: 'https://media-4.api-sports.io/football/leagues/61.png',
          country: 'France'
        },
        homeTeam: {
          id: 85,
          name: 'Paris Saint Germain',
          logo: 'https://media-4.api-sports.io/football/teams/85.png'
        },
        awayTeam: {
          id: 91,
          name: 'Monaco',
          logo: 'https://media-4.api-sports.io/football/teams/91.png'
        }
      },
      
      // Partidos próximos
      {
        id: 5,
        date: '2025-05-24',
        time: '16:00',
        status: 'SCHEDULED',
        league: {
          id: 78,
          name: 'Bundesliga',
          logo: 'https://media-4.api-sports.io/football/leagues/78.png',
          country: 'Germany'
        },
        homeTeam: {
          id: 157,
          name: 'Bayern Munich',
          logo: 'https://media-4.api-sports.io/football/teams/157.png'
        },
        awayTeam: {
          id: 165,
          name: 'Borussia Dortmund',
          logo: 'https://media-4.api-sports.io/football/teams/165.png'
        }
      },
      {
        id: 6,
        date: '2025-05-24',
        time: '19:00',
        status: 'SCHEDULED',
        league: {
          id: 135,
          name: 'Serie A',
          logo: 'https://media-4.api-sports.io/football/leagues/135.png',
          country: 'Italy'
        },
        homeTeam: {
          id: 489,
          name: 'AC Milan',
          logo: 'https://media-4.api-sports.io/football/teams/489.png'
        },
        awayTeam: {
          id: 505,
          name: 'Inter',
          logo: 'https://media-4.api-sports.io/football/teams/505.png'
        }
      },
      
      // Partidos finalizados
      {
        id: 7,
        date: '2025-05-22',
        time: '19:30',
        status: 'FINISHED',
        league: {
          id: 39,
          name: 'Premier League',
          logo: 'https://media-4.api-sports.io/football/leagues/39.png',
          country: 'England'
        },
        homeTeam: {
          id: 42,
          name: 'Arsenal',
          logo: 'https://media-4.api-sports.io/football/teams/42.png'
        },
        awayTeam: {
          id: 47,
          name: 'Tottenham',
          logo: 'https://media-4.api-sports.io/football/teams/47.png'
        },
        score: {
          home: 2,
          away: 2
        }
      },
      {
        id: 8,
        date: '2025-05-22',
        time: '17:00',
        status: 'FINISHED',
        league: {
          id: 140,
          name: 'La Liga',
          logo: 'https://media-4.api-sports.io/football/leagues/140.png',
          country: 'Spain'
        },
        homeTeam: {
          id: 530,
          name: 'Atlético Madrid',
          logo: 'https://media-4.api-sports.io/football/teams/530.png'
        },
        awayTeam: {
          id: 538,
          name: 'Sevilla',
          logo: 'https://media-4.api-sports.io/football/teams/538.png'
        },
        score: {
          home: 3,
          away: 0
        }
      }
    ];
    
    // Agregar más partidos de ejemplo para mostrar la paginación
    for (let i = 9; i <= 20; i++) {
      this.allMatches.push({
        id: i,
        date: '2025-05-25',
        time: `${Math.floor(Math.random() * 12 + 12)}:${Math.random() > 0.5 ? '00' : '30'}`,
        status: 'SCHEDULED',
        league: this.leagues[Math.floor(Math.random() * this.leagues.length)],
        homeTeam: {
          id: 1000 + i,
          name: `Equipo Local ${i}`,
          logo: 'https://via.placeholder.com/40'
        },
        awayTeam: {
          id: 2000 + i,
          name: `Equipo Visitante ${i}`,
          logo: 'https://via.placeholder.com/40'
        }
      });
    }
  }
}