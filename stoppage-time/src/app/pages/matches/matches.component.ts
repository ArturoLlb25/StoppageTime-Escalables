import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlsComponent } from '../../components/controls/controls.component';
import { MatchCardComponent } from '../../components/match-card/match-card.component';
import { FootballApiService } from '../../services/football-api.service';
import { Match } from '../../interfaces/match.interface';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ControlsComponent,
    MatchCardComponent,
    MatIcon
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
  error = false;
  errorMessage = '';
  
  filterType = 'all';
  selectedLeague = 'all';
  searchQuery = '';
  
  leagues: { id: number, name: string }[] = [
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
    this.error = false;
    this.errorMessage = '';
    
    this.footballApiService.getLiveMatches().subscribe({
      next: (matches) => {
        this.allMatches = matches || [];
        this.filterMatches();
        this.loading = false;
        
        // Verificar si hay partidos
        if (this.allMatches.length === 0) {
          this.noMatchesFound = true;
        }
      },
      error: (error) => {
        console.error('Error al cargar partidos:', error);
        this.loading = false;
        this.error = true;
        this.errorMessage = 'Error al cargar los partidos. Por favor, inténtalo de nuevo más tarde.';
        this.noMatchesFound = true;
      }
    });
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
}