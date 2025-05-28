// Update src/app/pages/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatchCardComponent } from '../../components/match-card/match-card.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { FootballApiService } from '../../services/football-api.service';
import { NewsService } from '../../services/news.service';
import { StatisticsService } from '../../services/statistics.service';
import { Match } from '../../interfaces/match.interface';
import { News } from '../../interfaces/news.interface';
import { LeagueStatistics, LeagueStanding } from '../../interfaces/statistics.interface';

interface LeagueTab {
  id: number;
  name: string;
  country: string;
  logo: string;
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
  loadingStats = true;
  errorMatches = false;
  errorStats = false;
  
  constructor(
    private footballApiService: FootballApiService,
    private newsService: NewsService,
    private statisticsService: StatisticsService
  ) {}
  
  ngOnInit(): void {
    this.loadLiveMatches();
    this.loadFeaturedNews();
    this.loadLeagueStatistics();
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
        // If hay error, mantener un array vacío
        this.liveMatches = [];
      }
    });
  }
  
  private loadFeaturedNews(): void {
    this.loadingNews = true;
    
    this.newsService.getFeaturedNews().subscribe({
      next: (news) => {
        console.log('Noticias destacadas recibidas en home:', news);
        // Verificar que cada noticia tiene un ID válido
        this.featuredNews = news.filter(item => item && item.id);
        
        // Si no hay noticias destacadas válidas, intentar cargar todas las noticias
        if (this.featuredNews.length === 0) {
          this.loadAllNews();
        }
        this.loadingNews = false;
      },
      error: (error) => {
        console.error('Error al cargar noticias destacadas:', error);
        this.featuredNews = [];
        this.loadingNews = false;
      }
    });
  }

  private loadAllNews(): void {
    this.newsService.getAllNews().subscribe({
      next: (news) => {
        console.log('Todas las noticias recibidas en home:', news);
        // Tomar las 3 primeras noticias si están disponibles
        this.featuredNews = news.slice(0, 3);
      },
      error: (error) => {
        console.error('Error al cargar todas las noticias:', error);
        this.featuredNews = [];
      }
    });
  }
  
  loadLeagueStatistics(): void {
    this.loadingStats = true;
    this.errorStats = false;
    
    // Get statistics for all supported leagues
    this.statisticsService.getAllLeagueStatistics().subscribe({
      next: (statistics) => {
        // Create league tabs for display
        this.leagueTabs = statistics.map(stat => ({
          id: stat.leagueId,
          name: stat.leagueName,
          country: stat.leagueCountry,
          logo: stat.leagueLogo,
          standings: stat.standings.slice(0, 5) // Only show top 5 teams
        }));
        
        this.loadingStats = false;
        
        // If no data is available, use empty tabs
        if (this.leagueTabs.length === 0) {
          // Initialize with supported leagues but empty standings
          this.leagueTabs = this.statisticsService.supportedLeagues.map(league => ({
            id: league.id,
            name: league.name,
            country: league.country,
            logo: league.logo,
            standings: []
          }));
        }
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.loadingStats = false;
        this.errorStats = true;
        
        // Initialize with supported leagues but empty standings
        this.leagueTabs = this.statisticsService.supportedLeagues.map(league => ({
          id: league.id,
          name: league.name,
          country: league.country,
          logo: league.logo,
          standings: []
        }));
      }
    });
  }
  
  setActiveTab(index: number): void {
    this.activeTabIndex = index;
  }
}