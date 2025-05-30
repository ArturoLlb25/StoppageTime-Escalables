import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LeagueStatistics } from '../interfaces/statistics.interface';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private backendUrl = environment.backendUrl;
  
 
  supportedLeagues = [
    { id: 39, name: 'Premier League', country: 'England', logo: 'https://media.api-sports.io/football/leagues/39.png' },
    { id: 140, name: 'La Liga', country: 'Spain', logo: 'https://media.api-sports.io/football/leagues/140.png' },
    { id: 78, name: 'Bundesliga', country: 'Germany', logo: 'https://media.api-sports.io/football/leagues/78.png' },
    { id: 135, name: 'Serie A', country: 'Italy', logo: 'https://media.api-sports.io/football/leagues/135.png' },
    { id: 61, name: 'Ligue 1', country: 'France', logo: 'https://media.api-sports.io/football/leagues/61.png' }
  ];

  constructor(private http: HttpClient) { }

  getAllLeagueStatistics(season: number = 2023): Observable<LeagueStatistics[]> {
    return this.http.get<LeagueStatistics[]>(`${this.backendUrl}/statistics?season=${season}`).pipe(
      catchError(this.handleError<LeagueStatistics[]>('getAllLeagueStatistics', []))
    );
  }

  
  getLeagueStatistics(leagueId: number, season: number = 2023): Observable<LeagueStatistics> {
    return this.http.get<LeagueStatistics>(`${this.backendUrl}/statistics/${leagueId}?season=${season}`).pipe(
      catchError(this.handleError<LeagueStatistics>('getLeagueStatistics'))
    );
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
   
      return of(result as T);
    };
  }
}