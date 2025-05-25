import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { News } from '../interfaces/news.interface';
import { Comment } from '../interfaces/comment.interface';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private backendUrl = environment.backendUrl;
  
  constructor(private http: HttpClient) { }

  // Obtener todas las noticias
  getAllNews(): Observable<News[]> {
  return this.http.get<News[]>(`${this.backendUrl}/news`)
    .pipe(
      tap(news => {
        console.log('Noticias recibidas:', news);
        // Verifica que cada noticia tenga un ID válido
        news.forEach(item => {
          if (!item.id) {
            console.warn('Noticia sin ID:', item);
          }
        });
      }),
      catchError(error => {
        console.error('Error al obtener noticias:', error);
        // Retornar array vacío en caso de error
        return of([]);
      })
    );
}

  // Obtener noticias destacadas
  getFeaturedNews(): Observable<News[]> {
    return this.http.get<News[]>(`${this.backendUrl}/news/featured`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener noticias destacadas:', error);
          // Retornar array vacío en caso de error
          return of([]);
        })
      );
  }

  // Obtener una noticia por ID
  getNewsById(id: string): Observable<News> {
    console.log(`Solicitando noticia con ID: "${id}"`);
    
    if (!id || id === 'undefined') {
      console.error('Intentando obtener noticia con ID inválido');
      return throwError(() => new Error('ID no válido'));
    }
    
    return this.http.get<News>(`${this.backendUrl}/news/${id}`)
      .pipe(
        tap(news => {
          console.log(`Noticia obtenida con ID: ${id}`, news);
        }),
        catchError(error => {
          console.error(`Error al obtener noticia con ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Crear una noticia (admin)
  createNews(news: Omit<News, 'id'>): Observable<News> {
    return this.http.post<News>(`${this.backendUrl}/news`, news)
      .pipe(
        catchError(error => {
          console.error('Error al crear la noticia:', error);
          return throwError(() => error);
        })
      );
  }

  // Actualizar una noticia (admin)
  updateNews(id: string, news: Partial<News>): Observable<News> {
    return this.http.put<News>(`${this.backendUrl}/news/${id}`, news)
      .pipe(
        catchError(error => {
          console.error(`Error al actualizar la noticia con ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Eliminar una noticia (admin)
  deleteNews(id: string): Observable<any> {
    return this.http.delete(`${this.backendUrl}/news/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error al eliminar la noticia con ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Obtener comentarios de una noticia
  getComments(newsId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.backendUrl}/news/${newsId}/comments`)
      .pipe(
        catchError(error => {
          console.error(`Error al obtener comentarios para la noticia ${newsId}:`, error);
          // Retornar array vacío en caso de error
          return of([]);
        })
      );
  }

  // Añadir un comentario
  addComment(newsId: string, content: string, parentId?: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.backendUrl}/news/${newsId}/comments`, {
      content,
      parentId
    }).pipe(
      catchError(error => {
        console.error(`Error al añadir comentario a la noticia ${newsId}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Editar un comentario
  updateComment(newsId: string, commentId: string, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.backendUrl}/news/${newsId}/comments/${commentId}`, {
      content
    }).pipe(
      catchError(error => {
        console.error(`Error al actualizar el comentario ${commentId}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Eliminar un comentario
  deleteComment(newsId: string, commentId: string): Observable<any> {
    return this.http.delete(`${this.backendUrl}/news/${newsId}/comments/${commentId}`)
      .pipe(
        catchError(error => {
          console.error(`Error al eliminar el comentario ${commentId}:`, error);
          return throwError(() => error);
        })
      );
  }
}