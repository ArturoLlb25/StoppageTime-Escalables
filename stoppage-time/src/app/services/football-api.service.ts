import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Match, League, Player } from '../interfaces/match.interface';

@Injectable({
  providedIn: 'root'
})
export class FootballApiService {
  private apiUrl = environment.apiUrl;
  private backendUrl = environment.backendUrl; // Añadido para usar el backend
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'x-rapidapi-key': this.apiKey,
      'x-rapidapi-host': 'v3.football.api-sports.io'
    });
  }

  // Obtener partidos desde nuestro backend
  getLiveMatches(): Observable<Match[]> {
    return this.http.get<any[]>(`${this.backendUrl}/matches`).pipe(
      map(matches => this.mapToMatchInterface(matches)),
      catchError(this.handleError('getLiveMatches', []))
    );
  }

  // Obtener partidos por fecha (ahora desde nuestro backend)
  getMatchesByDate(date: string): Observable<Match[]> {
    return this.http.get<any[]>(`${this.backendUrl}/matches?date=${date}`).pipe(
      map(matches => this.mapToMatchInterface(matches)),
      catchError(this.handleError('getMatchesByDate', []))
    );
  }

  // Obtener detalles de un partido
  getMatchDetails(matchId: number): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/matches/${matchId}`).pipe(
      catchError(this.handleError('getMatchDetails', {}))
    );
  }

  // Transformar la respuesta del backend al formato esperado por el frontend
  private mapToMatchInterface(apiMatches: any[]): Match[] {
    return apiMatches.map(match => {
      return {
        id: match.id,
        date: match.date,
        time: match.time,
        status: match.status,
        round: match.round,
        league: match.league,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        score: match.score
      };
    });
  }

  // Mantener los métodos existentes que acceden directamente a la API externa
  
  // Obtener estadísticas de un partido
  getMatchStatistics(matchId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/fixtures/statistics`, {
      headers: this.getHeaders(),
      params: {
        fixture: matchId.toString()
      }
    }).pipe(
      catchError(this.handleError('getMatchStatistics', {}))
    );
  }

  // Obtener eventos de un partido
  getMatchEvents(matchId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/fixtures/events`, {
      headers: this.getHeaders(),
      params: {
        fixture: matchId.toString()
      }
    }).pipe(
      catchError(this.handleError('getMatchEvents', {}))
    );
  }

  // Obtener alineaciones de un partido
  getMatchLineups(matchId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/fixtures/lineups`, {
      headers: this.getHeaders(),
      params: {
        fixture: matchId.toString()
      }
    }).pipe(
      catchError(this.handleError('getMatchLineups', {}))
    );
  }

  // Obtener clasificación de una liga
  getLeagueStandings(leagueId: number, season: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/standings`, {
      headers: this.getHeaders(),
      params: {
        league: leagueId.toString(),
        season: season.toString()
      }
    }).pipe(
      catchError(this.handleError('getLeagueStandings', {}))
    );
  }

  // Obtener estadísticas de jugadores
  getPlayerStats(leagueId: number, season: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/players`, {
      headers: this.getHeaders(),
      params: {
        league: leagueId.toString(),
        season: season.toString(),
        page: '1'
      }
    }).pipe(
      catchError(this.handleError('getPlayerStats', {}))
    );
  }

  // Obtener lista de ligas
  getLeagues(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leagues`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError('getLeagues', {}))
    );
  }

  // Obtener equipos de una liga
  getTeams(leagueId: number, season: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/teams`, {
      headers: this.getHeaders(),
      params: {
        league: leagueId.toString(),
        season: season.toString()
      }
    }).pipe(
      catchError(this.handleError('getTeams', {}))
    );
  }

  // Obtener los últimos 5 partidos de un equipo (todas las competiciones)
  getLastMatches(teamId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/fixtures`, {
      headers: this.getHeaders(),
      params: {
        team: teamId.toString(),
        last: '5'
      }
    }).pipe(
      map((res: any) => res.response || []),
      catchError(this.handleError('getLastMatches', []))
    );
  }

  // Manejo de errores
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // Log del error
      console.error(`${operation} failed:`, error);
      
      // Devolver un resultado vacío para seguir funcionando
      return of(result as T);
    };
  }
}