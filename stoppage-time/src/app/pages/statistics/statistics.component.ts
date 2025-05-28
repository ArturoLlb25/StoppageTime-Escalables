// src/app/pages/statistics/statistics.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatisticsService } from '../../services/statistics.service';
import { LeagueStatistics, LeagueStanding, PlayerStat } from '../../interfaces/statistics.interface';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  // League selection
  selectedLeagueId: number = 39; // Default to Premier League
  selectedSeason: number = 2023; // Default to 2023 season
  
  // League data
  leagueStatistics: LeagueStatistics | null = null;
  
  // UI state
  loading = true;
  error = false;
  errorMessage = '';
  
  // Active tab
  activeTab: 'standings' | 'scorers' | 'assisters' = 'standings';
  
  // Supported leagues from service
  get leagues() {
    return this.statisticsService.supportedLeagues;
  }
  
  // Available seasons
  seasons: number[] = [2023, 2022, 2021, 2020];
  
  constructor(private statisticsService: StatisticsService) {}
  
  ngOnInit(): void {
    this.loadLeagueStatistics();
  }
  
  loadLeagueStatistics(): void {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    
    this.statisticsService.getLeagueStatistics(this.selectedLeagueId, this.selectedSeason).subscribe({
      next: (statistics) => {
        if (statistics) {
          this.leagueStatistics = statistics;
        } else {
          this.error = true;
          this.errorMessage = 'No se encontraron estadísticas para esta liga y temporada';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.loading = false;
        this.error = true;
        this.errorMessage = 'Error al cargar las estadísticas. Por favor, inténtalo de nuevo más tarde.';
      }
    });
  }
  
  onLeagueChange(): void {
    this.loadLeagueStatistics();
  }
  
  onSeasonChange(): void {
    this.loadLeagueStatistics();
  }
  
  setActiveTab(tab: 'standings' | 'scorers' | 'assisters'): void {
    this.activeTab = tab;
  }
  
  // Get current league info
  get currentLeague() {
    return this.leagues.find(league => league.id === this.selectedLeagueId);
  }
  
  // Format date
  formatDate(date: string | Date): string {
    if (!date) return 'No disponible';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}