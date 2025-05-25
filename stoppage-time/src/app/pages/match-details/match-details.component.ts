import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CommentsSectionComponent } from '../../components/comments-section/comments-section.component';
import { FootballApiService } from '../../services/football-api.service';
import { Match, MatchEvent, Player, Goal, Card, Substitution } from '../../interfaces/match.interface';

interface StatItem {
  label: string;
  home: number | string;
  away: number | string;
  homePercentage: number;
  awayPercentage: number;
}

@Component({
  selector: 'app-match-details',
  standalone: true,
  imports: [
    CommonModule,
    CommentsSectionComponent
  ],
  templateUrl: './match-details.component.html',
  styleUrls: ['./match-details.component.css']
})
export class MatchDetailsComponent implements OnInit {
  match: Match | null = null;
  statistics: StatItem[] = [];
  events: MatchEvent[] = [];
  homeLineup: Player[] = [];
  homeSubs: Player[] = [];
  awayLineup: Player[] = [];
  awaySubs: Player[] = [];
  hasLineups = false;
  
  tabs: string[] = ['Estadísticas', 'Alineaciones', 'Eventos', 'Comentarios'];
  activeTabIndex = 0;
  
  constructor(
    private route: ActivatedRoute,
    private footballApiService: FootballApiService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const matchId = Number(params.get('id'));
      this.loadMatch(matchId);
    });
  }
  
  loadMatch(matchId: number): void {
    this.footballApiService.getMatchDetails(matchId).subscribe(
      response => {
        // En un caso real, procesaríamos la respuesta de la API
        // Por ahora, usamos datos de ejemplo
        setTimeout(() => {
          this.loadExampleMatch(matchId);
          this.loadExampleStatistics();
          this.loadExampleEvents();
          this.loadExampleLineups();
        }, 1000);
      },
      error => {
        console.error('Error al cargar detalles del partido:', error);
        // Cargar datos de ejemplo en caso de error
        this.loadExampleMatch(matchId);
        this.loadExampleStatistics();
        this.loadExampleEvents();
        this.loadExampleLineups();
      }
    );
  }
  
  setActiveTab(index: number): void {
    this.activeTabIndex = index;
  }
  
  getStatusClass(): string {
    if (!this.match) return '';
    
    switch (this.match.status) {
      case 'LIVE': return 'live';
      case 'SCHEDULED': return 'scheduled';
      case 'FINISHED': return 'finished';
      case 'CANCELED': return 'finished';
      default: return '';
    }
  }
  
  getStatusText(): string {
    if (!this.match) return '';
    
    switch (this.match.status) {
      case 'LIVE': return 'En vivo';
      case 'SCHEDULED': return 'Programado';
      case 'FINISHED': return 'Finalizado';
      case 'CANCELED': return 'Cancelado';
      default: return '';
    }
  }
  
  formatMatchDate(): string {
    if (!this.match) return '';
    
    const date = new Date(`${this.match.date}T${this.match.time}`);
    
    // Formatear fecha y hora
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    const formattedDate = date.toLocaleDateString('es-MX', dateOptions);
    const formattedTime = date.toLocaleTimeString('es-MX', timeOptions);
    
    return `${formattedDate} - ${formattedTime}`;
  }
  
  getTeamNameById(teamId: number): string {
    if (!this.match) return '';
    
    if (teamId === this.match.homeTeam.id) {
      return this.match.homeTeam.name;
    } else if (teamId === this.match.awayTeam.id) {
      return this.match.awayTeam.name;
    }
    
    return '';
  }
  
  // Type guards para verificar el tipo de evento
  isGoalEvent(event: MatchEvent): event is MatchEvent & { detail: Goal } {
    return event.type === 'goal';
  }

  isCardEvent(event: MatchEvent): event is MatchEvent & { detail: Card } {
    return event.type === 'card';
  }

  isSubstitutionEvent(event: MatchEvent): event is MatchEvent & { detail: Substitution } {
    return event.type === 'substitution';
  }
  
  private loadExampleMatch(matchId: number): void {
    if (matchId === 1) {
      this.match = {
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
      };
    } else if (matchId === 2) {
      this.match = {
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
      };
    } else {
      // Partido de ejemplo genérico
      this.match = {
        id: matchId,
        date: '2025-05-23',
        time: '20:00',
        status: 'SCHEDULED',
        league: {
          id: 1,
          name: 'Liga de Ejemplo',
          logo: 'https://via.placeholder.com/30',
          country: 'País de Ejemplo'
        },
        homeTeam: {
          id: 100,
          name: 'Equipo Local',
          logo: 'https://via.placeholder.com/100'
        },
        awayTeam: {
          id: 200,
          name: 'Equipo Visitante',
          logo: 'https://via.placeholder.com/100'
        }
      };
    }
  }
  
  private loadExampleStatistics(): void {
    this.statistics = [
      {
        label: 'Posesión',
        home: '58%',
        away: '42%',
        homePercentage: 58,
        awayPercentage: 42
      },
      {
        label: 'Tiros',
        home: 12,
        away: 8,
        homePercentage: 60,
        awayPercentage: 40
      },
      {
        label: 'Tiros a portería',
        home: 5,
        away: 3,
        homePercentage: 62.5,
        awayPercentage: 37.5
      },
      {
        label: 'Córners',
        home: 7,
        away: 3,
        homePercentage: 70,
        awayPercentage: 30
      },
      {
        label: 'Faltas',
        home: 10,
        away: 14,
        homePercentage: 42,
        awayPercentage: 58
      },
      {
        label: 'Fueras de juego',
        home: 2,
        away: 3,
        homePercentage: 40,
        awayPercentage: 60
      }
    ];
  }
  
  private loadExampleEvents(): void {
    if (!this.match) return;
    
    const homeTeamId = this.match.homeTeam.id;
    const awayTeamId = this.match.awayTeam.id;
    
    this.events = [
      {
        type: 'goal',
        minute: 23,
        detail: {
          teamId: homeTeamId,
          minute: 23,
          player: 'Julián Álvarez'
        }
      },
      {
        type: 'card',
        minute: 34,
        detail: {
          teamId: awayTeamId,
          minute: 34,
          player: 'Marcus Rashford',
          type: 'yellow'
        }
      },
      {
        type: 'goal',
        minute: 45,
        detail: {
          teamId: awayTeamId,
          minute: 45,
          player: 'Bruno Fernandes'
        }
      },
      {
        type: 'substitution',
        minute: 46,
        detail: {
          teamId: homeTeamId,
          minute: 46,
          playerIn: 'Diogo Jota',
          playerOut: 'Darwin Núñez'
        }
      },
      {
        type: 'card',
        minute: 58,
        detail: {
          teamId: awayTeamId,
          minute: 58,
          player: 'Casemiro',
          type: 'yellow'
        }
      },
      {
        type: 'goal',
        minute: 67,
        detail: {
          teamId: homeTeamId,
          minute: 67,
          player: 'Mohamed Salah'
        }
      },
      {
        type: 'card',
        minute: 75,
        detail: {
          teamId: awayTeamId,
          minute: 75,
          player: 'Lisandro Martínez',
          type: 'red'
        }
      },
      {
        type: 'goal',
        minute: 82,
        detail: {
          teamId: homeTeamId,
          minute: 82,
          player: 'Mohamed Salah'
        }
      }
    ];
  }
  
  private loadExampleLineups(): void {
    if (!this.match) return;
    
    // Solo cargamos alineaciones para partidos en vivo o finalizados
    if (this.match.status === 'SCHEDULED') {
      this.hasLineups = false;
      return;
    }
    
    this.hasLineups = true;
    
    // Alineación del equipo local
    this.homeLineup = [
      { id: 1, name: 'Alisson', position: 'POR', number: 1, isCaptain: false },
      { id: 2, name: 'Alexander-Arnold', position: 'LD', number: 66, isCaptain: false },
      { id: 3, name: 'Van Dijk', position: 'DFC', number: 4, isCaptain: true },
      { id: 4, name: 'Konaté', position: 'DFC', number: 5, isCaptain: false },
      { id: 5, name: 'Robertson', position: 'LI', number: 26, isCaptain: false },
      { id: 6, name: 'Mac Allister', position: 'MC', number: 10, isCaptain: false },
      { id: 7, name: 'Jones', position: 'MC', number: 17, isCaptain: false },
      { id: 8, name: 'Szoboszlai', position: 'MC', number: 8, isCaptain: false },
      { id: 9, name: 'Salah', position: 'ED', number: 11, isCaptain: false },
      { id: 10, name: 'Núñez', position: 'DC', number: 9, isCaptain: false },
      { id: 11, name: 'Luis Díaz', position: 'EI', number: 7, isCaptain: false }
    ];
    
    this.homeSubs = [
      { id: 12, name: 'Kelleher', position: 'POR', number: 62, isCaptain: false },
      { id: 13, name: 'Gomez', position: 'DF', number: 2, isCaptain: false },
      { id: 14, name: 'Endo', position: 'MC', number: 3, isCaptain: false },
      { id: 15, name: 'Jota', position: 'DC', number: 20, isCaptain: false },
      { id: 16, name: 'Gakpo', position: 'DC', number: 18, isCaptain: false },
      { id: 17, name: 'Elliott', position: 'MC', number: 19, isCaptain: false },
      { id: 18, name: 'Tsimikas', position: 'LI', number: 21, isCaptain: false }
    ];
    
    // Alineación del equipo visitante
    this.awayLineup = [
      { id: 19, name: 'Onana', position: 'POR', number: 24, isCaptain: false },
      { id: 20, name: 'Wan-Bissaka', position: 'LD', number: 29, isCaptain: false },
      { id: 21, name: 'Varane', position: 'DFC', number: 19, isCaptain: false },
      { id: 22, name: 'Martínez', position: 'DFC', number: 6, isCaptain: false },
      { id: 23, name: 'Dalot', position: 'LI', number: 20, isCaptain: false },
      { id: 24, name: 'Casemiro', position: 'MCD', number: 18, isCaptain: false },
      { id: 25, name: 'Mount', position: 'MC', number: 7, isCaptain: false },
      { id: 26, name: 'Fernandes', position: 'MCO', number: 8, isCaptain: true },
      { id: 27, name: 'Garnacho', position: 'ED', number: 17, isCaptain: false },
      { id: 28, name: 'Højlund', position: 'DC', number: 11, isCaptain: false },
      { id: 29, name: 'Rashford', position: 'EI', number: 10, isCaptain: false }
    ];
    
    this.awaySubs = [
      { id: 30, name: 'Bayindir', position: 'POR', number: 30, isCaptain: false },
      { id: 31, name: 'Maguire', position: 'DFC', number: 5, isCaptain: false },
      { id: 32, name: 'Eriksen', position: 'MC', number: 14, isCaptain: false },
      { id: 33, name: 'Antony', position: 'ED', number: 21, isCaptain: false },
      { id: 34, name: 'McTominay', position: 'MC', number: 39, isCaptain: false },
      { id: 35, name: 'Amad', position: 'ED', number: 16, isCaptain: false },
      { id: 36, name: 'Evans', position: 'DFC', number: 35, isCaptain: false }
    ];
  }
}