import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FootballApiService } from '../../services/football-api.service';
import { Match } from '../../interfaces/match.interface';

@Component({
  selector: 'app-match-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-details.component.html',
  styleUrls: ['./match-details.component.css']
})
export class MatchDetailsComponent implements OnInit {
  match: Match | null = null;
  statistics: any[] = [];
  isLoading = true;
  error = false;

  lastMatchesHome: any[] = [];
  lastMatchesAway: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private footballApiService: FootballApiService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const matchId = Number(params.get('id'));
      if (!matchId) {
        this.error = true;
        this.isLoading = false;
        return;
      }
      this.footballApiService.getMatchDetails(matchId).subscribe(
        match => {
          this.match = match;
          this.isLoading = false;
          if (this.match && this.match.status === 'FINISHED') {
            this.loadStatistics(matchId);
          } else if (this.match && this.match.status === 'SCHEDULED') {
            this.statistics = [{ label: 'Partido programado', value: 'Sin estadísticas aún' }];
            this.loadLastMatches();
          }
        },
        err => {
          this.error = true;
          this.isLoading = false;
        }
      );
    });
  }

  loadStatistics(matchId: number) {
    this.footballApiService.getMatchStatistics(matchId).subscribe(
      stats => {
        // Aquí deberías mapear los stats reales, esto es solo ejemplo
        this.statistics = [
          { label: 'Posesión', home: '55%', away: '45%' },
          { label: 'Tiros', home: 10, away: 7 },
        ];
      },
      err => {
        this.statistics = [];
      }
    );
  }

  loadLastMatches() {
    if (!this.match) return;
    // Home team
    this.footballApiService.getLastMatches(this.match.homeTeam.id).subscribe(
      matches => {
        this.lastMatchesHome = matches;
      }
    );
    // Away team
    this.footballApiService.getLastMatches(this.match.awayTeam.id).subscribe(
      matches => {
        this.lastMatchesAway = matches;
      }
    );
  }

  getResultClass(match: any, teamId: number): string {
    const isHome = match.teams.home.id === teamId;
    const homeGoals = match.goals.home;
    const awayGoals = match.goals.away;
    if (homeGoals === null || awayGoals === null) return '';
    if (homeGoals === awayGoals) return 'draw';
    if ((isHome && homeGoals > awayGoals) || (!isHome && awayGoals > homeGoals)) return 'win';
    return 'lose';
  }
}