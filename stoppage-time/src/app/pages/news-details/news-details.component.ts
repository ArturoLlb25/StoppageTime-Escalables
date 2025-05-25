import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { CommentsSectionComponent } from '../../components/comments-section/comments-section.component';
import { NewsService } from '../../services/news.service';
import { AuthService } from '../../services/auth.service';
import { News } from '../../interfaces/news.interface';

@Component({
  selector: 'app-news-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NewsCardComponent,
    CommentsSectionComponent
  ],
  templateUrl: './news-details.component.html',
  styleUrls: ['./news-details.component.css']
})
export class NewsDetailsComponent implements OnInit {
  news: News | null = null;
  relatedNews: News[] = [];
  isAdmin = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService,
    private authService: AuthService
  ) {}
  
// En news-details.component.ts
  ngOnInit(): void {
    console.log('Inicializando NewsDetailsComponent');
    
    this.route.paramMap.subscribe(params => {
      const newsId = params.get('id');
      console.log(`Parámetro ID recibido: "${newsId}"`);
      
      if (newsId) {
        this.loadNews(newsId);
      } else {
        console.error('No se proporcionó ID en los parámetros');
        this.router.navigate(['/not-found']);
      }
    });
    
    this.checkUserRole();
  }
  
  checkUserRole(): void {
    this.authService.currentUser.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
    });
  }
  
  loadNews(id: string): void {
    console.log(`Iniciando carga de noticia con ID: "${id}"`);
    
    if (!id || id === 'undefined') {
      console.error('ID no válido en loadNews');
      this.router.navigate(['/not-found']);
      return;
    }
    
    this.newsService.getNewsById(id).subscribe({
      next: (news) => {
        console.log('Noticia recibida:', news);
        if (news) {
          this.news = news;
          this.loadRelatedNews();
        } else {
          console.error('Noticia recibida es null o undefined');
          this.router.navigate(['/not-found']);
        }
      },
      error: (error) => {
        console.error('Error al cargar la noticia:', error);
        this.router.navigate(['/not-found']);
      }
    });
  }
  
  loadRelatedNews(): void {
    if (!this.news) return;
    
    this.newsService.getAllNews().subscribe(
      allNews => {
        // Filtrar noticias relacionadas (que compartan al menos una etiqueta)
        this.relatedNews = allNews
          .filter(n => n.id !== this.news?.id && n.tags.some(tag => this.news?.tags.includes(tag)))
          .slice(0, 3);
      }
    );
  }
  
  formatContent(): string[] {
    if (!this.news || !this.news.content) return [];
    
    // Dividir el contenido en párrafos
    return this.news.content.split('\n\n').filter(p => p.trim() !== '');
  }
  
  deleteNews(): void {
    if (!this.news || !this.isAdmin) return;
    
    if (confirm('¿Estás seguro de que deseas eliminar esta noticia?')) {
      this.newsService.deleteNews(this.news.id).subscribe(
        () => {
          this.router.navigate(['/news']);
        },
        error => {
          console.error('Error al eliminar la noticia:', error);
          alert('Ha ocurrido un error al eliminar la noticia. Por favor, inténtalo de nuevo.');
        }
      );
    }
  }
  
  shareOnFacebook(): void {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }
  
  shareOnTwitter(): void {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.news?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  }
  
  shareOnWhatsapp(): void {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.news?.title || '');
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  }
}