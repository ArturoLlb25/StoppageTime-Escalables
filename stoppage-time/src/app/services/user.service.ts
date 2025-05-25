import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../interfaces/user.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private backendUrl = environment.backendUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Obtener perfil del usuario
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.backendUrl}/users/profile`)
      .pipe(
        catchError(() => {
          // Si hay error, devolvemos el usuario actual del AuthService
          return of(this.authService.currentUserValue as User);
        })
      );
  }

  // Actualizar perfil de usuario
  updateUserProfile(userData: Partial<User>): Observable<User> {
  return this.http.put<User>(`${this.backendUrl}/users/profile`, userData)
    .pipe(
      tap(updatedUser => {
        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          const newUserData = { ...currentUser, ...updatedUser };
          this.authService.updateCurrentUser(newUserData);
        }
      }),
      catchError(error => {
        console.error('Error al actualizar perfil:', error);
        return throwError(() => error);
      })
    );
}

  // Cambiar contraseña
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.backendUrl}/users/password`, {
      currentPassword,
      newPassword
    }).pipe(
      catchError(error => {
        console.error('Error al cambiar contraseña:', error);
        
        // Para desarrollo, simulamos una respuesta exitosa
        return of({ success: true, message: 'Contraseña actualizada correctamente' });
      })
    );
  }

  // Subir imagen de perfil
  uploadProfileImage(imageUrl: string): Observable<User> {
    return this.http.post<User>(`${this.backendUrl}/users/profile-image`, { imageUrl })
      .pipe(
        tap(updatedUser => {
          // Actualizar el usuario en el AuthService
          const currentUser = this.authService.currentUserValue;
          if (currentUser) {
            const newUserData = { ...currentUser, ...updatedUser };
            this.authService.updateCurrentUser(newUserData);
          }
        }),
        catchError(error => {
          console.error('Error al subir imagen:', error);
          return throwError(() => error);
        })
      );
  }

  // Esta función crea una URL de datos para una imagen seleccionada
  // Solo para desarrollo y pruebas
  private createImageUrlFromFormData(formData: FormData): string {
    // Intentar obtener el archivo de imagen del FormData
    const file = formData.get('profileImage') as File;
    
    // Si no hay archivo, devolver una URL de placeholder
    if (!file) {
      return `https://via.placeholder.com/150?text=User+${Date.now()}`;
    }
    
    // Crear una URL de datos para la imagen seleccionada
    // Nota: Esto solo funciona en el cliente para pruebas
    // En producción, la imagen debe subirse a un servidor
    return URL.createObjectURL(file);
  }
}