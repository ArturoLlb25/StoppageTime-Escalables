import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../interfaces/comment.interface';
import { AuthService } from '../../services/auth.service';
import { NewsService } from '../../services/news.service';
import { User } from '../../interfaces/user.interface';
import { environment } from '../../../environments/environment';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-comments-section',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './comments-section.component.html',
  styleUrls: ['./comments-section.component.css']
})
export class CommentsSectionComponent implements OnInit {
  @Input() newsId!: string;
  
  comments: Comment[] = [];
  currentUser: any = null;
  isLoggedIn = false;
  isLoading = true;
  
  newCommentContent = '';
  replyContentMap: { [id: string]: string } = {};
  showReplyForm: string | null = null;
  
  editingComment: Comment | null = null;
  editContent = '';
  
  constructor(
    private authService: AuthService, 
    private newsService: NewsService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  private get isMatchComment(): boolean {
    return this.newsId.startsWith('match-');
  }
  
  ngOnInit(): void {
    this.loadComments();
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }
  
  loadComments(): void {
    if (!this.newsId) return;
    this.isLoading = true;
    const endpoint = this.isMatchComment 
      ? `${environment.backendUrl}/matches/${this.newsId.substring(6)}/comments`
      : `${environment.backendUrl}/news/${this.newsId}/comments`;
    
    this.http.get<Comment[]>(endpoint).subscribe(commentsFlat => {
      console.log('Comentarios recibidos del backend:', commentsFlat);
      // Asegura IDs y limpia replies
      commentsFlat.forEach(c => {
        if (c._id) c.id = c._id.toString();
        (c as any).replies = [];
      });

      // Mapeo por id
      const commentMap: { [id: string]: Comment & { replies: Comment[] } } = {};
      commentsFlat.forEach(c => {
        if (c.id) commentMap[c.id] = c as any;
      });

      // Anidar hasta 2 niveles de respuestas (respuesta y subrespuesta)
      commentsFlat.forEach(comment => {
        if (comment.parentId && commentMap[comment.parentId]) {
          commentMap[comment.parentId].replies.push(comment as any);
        }
      });

      // Solo los comentarios raíz (sin parentId)
      // Para cada respuesta, solo deja subrespuestas en su .replies
      this.comments = commentsFlat
        .filter(c => !c.parentId)
        .map(c => {
          // Solo un nivel de replies (respuestas directas)
          c.replies = (c.replies || []).map(reply => {
            // Solo un nivel de subreplies (subrespuestas directas)
            reply.replies = (reply.replies || []);
            return reply;
          });
          return c;
        });

      this.isLoading = false;
    }, error => {
      console.error('Error al cargar comentarios:', error);
      this.comments = [];
      this.isLoading = false;
      this.snackBar.open('Error al cargar comentarios', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    });
  }
  
  submitNewComment(): void {
    if (!this.newCommentContent.trim() || !this.isLoggedIn) return;
    
    const endpoint = this.isMatchComment 
      ? `${environment.backendUrl}/matches/${this.newsId.substring(6)}/comments`
      : `${environment.backendUrl}/news/${this.newsId}/comments`;
    
    this.http.post<Comment>(endpoint, {
      content: this.newCommentContent
    }).subscribe(
      comment => {
        // Añadir el nuevo comentario al principio de la lista
        this.comments.unshift({
          ...comment,
          replies: []
        });
        this.newCommentContent = '';
        this.snackBar.open('Comentario publicado', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error => {
        console.error('Error al publicar comentario:', error);
        this.snackBar.open('Error al publicar comentario', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    );
  }
  
  toggleReplyForm(commentId: string): void {
    this.showReplyForm = this.showReplyForm === commentId ? null : commentId;
    this.replyContentMap[commentId] = '';
    this.cancelEdit();
  }
  
  submitReply(parentId: string): void {
    const replyContent = this.replyContentMap[parentId] || '';
    if (!replyContent.trim() || !this.isLoggedIn) return;
    const endpoint = this.isMatchComment 
      ? `${environment.backendUrl}/matches/${this.newsId.substring(6)}/comments`
      : `${environment.backendUrl}/news/${this.newsId}/comments`;
    this.http.post<Comment>(endpoint, {
      content: replyContent,
      parentId
    }).subscribe(
      reply => {
        let parentComment = this.comments.find(c => c.id === parentId);
        if (parentComment) {
          if (!parentComment.replies) parentComment.replies = [];
          parentComment.replies.push(reply);
        } else {
          for (const comment of this.comments) {
            if (comment.replies) {
              const parentReply = comment.replies.find(r => r.id === parentId);
              if (parentReply) {
                if (!parentReply.replies) parentReply.replies = [];
                parentReply.replies.push(reply);
                break;
              }
            }
          }
        }
        this.replyContentMap[parentId] = '';
        this.showReplyForm = null;
        this.snackBar.open('Respuesta publicada', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error => {
        console.error('Error al publicar respuesta:', error);
        this.snackBar.open('Error al publicar respuesta', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    );
  }
  
  cancelReply(): void {
    this.showReplyForm = null;
  }
  
  startEditComment(comment: Comment): void {
    if (!comment || !comment.id) {
      console.error('Comentario inválido:', comment);
      return;
    }
    this.editingComment = comment;
    this.editContent = comment.content;
    this.showReplyForm = null;
  }
  
  submitEdit(): void {
    if (!this.editContent.trim() || !this.editingComment || !this.editingComment.id) {
      console.error('Datos de edición inválidos:', { 
        content: this.editContent, 
        comment: this.editingComment 
      });
      return;
    }
    
    this.newsService.updateComment(
      this.newsId, 
      this.editingComment.id, 
      this.editContent
    ).subscribe(
      updatedComment => {
        this.updateCommentInList(updatedComment);
        this.cancelEdit();
        this.snackBar.open('Comentario actualizado', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error => {
        console.error('Error al actualizar comentario:', error);
        this.snackBar.open('Error al actualizar comentario', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    );
  }
  
  cancelEdit(): void {
    this.editingComment = null;
    this.editContent = '';
  }
  
  deleteComment(commentId: string): void {
    if (!commentId || commentId === 'undefined') {
      console.error('ID de comentario inválido:', commentId);
      this.snackBar.open('Error: ID de comentario no válido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
      this.newsService.deleteComment(this.newsId, commentId).subscribe(
        () => {
          this.removeCommentFromList(commentId);
          this.snackBar.open('Comentario eliminado', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error => {
          console.error('Error al eliminar comentario:', error);
          this.snackBar.open('Error al eliminar comentario', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      );
    }
  }
  
  canEditComment(comment: Comment): boolean {
    return this.isLoggedIn && this.currentUser?.id === comment.userId;
  }
  
  canDeleteComment(comment: Comment): boolean {
    return this.isLoggedIn && (
      this.currentUser?.id === comment.userId || 
      this.currentUser?.role === 'admin'
    );
  }
  
  private updateCommentInList(updatedComment: Comment): void {
    if (!updatedComment || !updatedComment.id) return;

    // Buscar si es un comentario principal
    const index = this.comments.findIndex(c => c.id === updatedComment.id);
    if (index !== -1) {
      this.comments[index].content = updatedComment.content;
      return;
    }
    
    // Buscar en respuestas y subrespuestas
    for (const comment of this.comments) {
      if (comment.replies) {
        // Buscar en respuestas directas
        const replyIndex = comment.replies.findIndex(r => r.id === updatedComment.id);
        if (replyIndex !== -1) {
          comment.replies[replyIndex].content = updatedComment.content;
          return;
        }
        
        // Buscar en subrespuestas
        for (const reply of comment.replies) {
          if (reply.replies) {
            const subReplyIndex = reply.replies.findIndex(r => r.id === updatedComment.id);
            if (subReplyIndex !== -1) {
              reply.replies[subReplyIndex].content = updatedComment.content;
              return;
            }
          }
        }
      }
    }
  }
  
  private removeCommentFromList(commentId: string): void {
    if (!commentId || commentId === 'undefined') return;

    // Verificar si es un comentario principal
    const index = this.comments.findIndex(c => c.id === commentId);
    if (index !== -1) {
      this.comments.splice(index, 1);
      return;
    }
    
    // Verificar en respuestas y subrespuestas
    for (const comment of this.comments) {
      if (comment.replies) {
        // Buscar en respuestas directas
        const replyIndex = comment.replies.findIndex(r => r.id === commentId);
        if (replyIndex !== -1) {
          comment.replies.splice(replyIndex, 1);
          return;
        }
        
        // Buscar en subrespuestas
        for (const reply of comment.replies) {
          if (reply.replies) {
            const subReplyIndex = reply.replies.findIndex(r => r.id === commentId);
            if (subReplyIndex !== -1) {
              reply.replies.splice(subReplyIndex, 1);
              return;
            }
          }
        }
      }
    }
  }
}