import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private backendUrl = environment.backendUrl;

  constructor(private http: HttpClient, private router: Router) {
    // Cargar usuario desde localStorage al iniciar
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            const user: User = {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              profilePicture: response.user.profilePicture,
              role: response.user.role
            };
            localStorage.setItem('token', response.token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/auth/register`, { 
      name, 
      email, 
      password 
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Para desarrollo, podemos usar este método para simular un login
  mockLogin(isAdmin: boolean = false): void {
    const mockUser: User = {
      id: '1',
      name: 'Usuario de Prueba',
      email: 'usuario@prueba.com',
      profilePicture: 'https://via.placeholder.com/150',
      role: isAdmin ? 'admin' : 'user'
    };
    
    localStorage.setItem('token', 'mock-token-123');
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    this.currentUserSubject.next(mockUser);
  }


  /**
 * Actualiza los datos del usuario actual
 * @param user Datos actualizados del usuario
 */
  updateCurrentUser(user: User): void {
    // Actualizar el usuario en localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Actualizar el BehaviorSubject
    this.currentUserSubject.next(user);
  }
}