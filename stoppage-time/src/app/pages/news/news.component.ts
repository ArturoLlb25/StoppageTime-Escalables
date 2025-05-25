import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ControlsComponent } from '../../components/controls/controls.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { NewsService } from '../../services/news.service';
import { AuthService } from '../../services/auth.service';
import { News } from '../../interfaces/news.interface';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ControlsComponent,
    NewsCardComponent
  ],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  allNews: News[] = [];
  filteredNews: News[] = [];
  featuredNews: News[] = [];
  paginatedNews: News[] = [];
  
  loading = true;
  showFeatured = true;
  isAdmin = false;
  
  categories: string[] = ['Liga MX', 'Premier League', 'La Liga', 'Ligue 1', 'Bundesliga', 'Serie A', 'Champions League', 'Mundial 2026', 'Eurocopa 2024', 'UEFA', 'FIFA'];
  selectedCategory = 'all';
  sortBy = 'newest';
  searchQuery = '';
  
  // Paginación
  pageSize = 6;
  currentPage = 0;
  totalPages = 1;
  
  constructor(
    private newsService: NewsService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadNews();
    this.checkUserRole();
  }
  
  checkUserRole(): void {
    this.authService.currentUser.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
    });
  }
  
  loadNews(): void {
    this.loading = true;
    
    this.newsService.getAllNews().subscribe(
      news => {
        this.allNews = news;
        this.applyFilters();
        
        // Solo establecer noticias destacadas si hay suficientes noticias
        if (this.allNews.length > 0) {
          this.setFeaturedNews();
        } else {
          this.featuredNews = [];
        }
        
        this.loading = false;
      },
      error => {
        console.error('Error al cargar noticias:', error);
        this.allNews = [];
        this.filteredNews = [];
        this.featuredNews = [];
        this.loading = false;
      }
    );
  }
  
  onSearch(query: string): void {
    this.searchQuery = query;
    this.currentPage = 0;
    this.applyFilters();
  }
  
  applyFilters(): void {
    let filtered = [...this.allNews];
    
    // Filtrar por categoría
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(news => 
        news.tags.includes(this.selectedCategory)
      );
    }
    
    // Filtrar por búsqueda
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(news => 
        news.title.toLowerCase().includes(query) || 
        news.content.toLowerCase().includes(query) || 
        news.summary.toLowerCase().includes(query) ||
        news.author.toLowerCase().includes(query) ||
        news.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      if (this.sortBy === 'newest') {
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      } else {
        return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
      }
    });
    
    this.filteredNews = filtered;
    this.totalPages = Math.ceil(this.filteredNews.length / this.pageSize);
    this.updatePaginatedNews();
    
    // Ocultar la sección de destacados si se está realizando una búsqueda o filtrado
    // o si no hay suficientes noticias
    this.showFeatured = this.searchQuery === '' && 
                        this.selectedCategory === 'all' && 
                        this.allNews.length >= 3;
  }
  
  resetFilters(): void {
    this.selectedCategory = 'all';
    this.sortBy = 'newest';
    this.searchQuery = '';
    this.currentPage = 0;
    this.applyFilters();
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedNews();
  }
  
  updatePaginatedNews(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedNews = this.filteredNews.slice(start, end);
  }
  
  setFeaturedNews(): void {
    // Tomamos hasta 3 noticias para destacadas, dando prioridad a las que tienen etiquetas
    // y son más recientes
    this.featuredNews = this.allNews
      .filter(news => news.tags.length > 0) // Solo noticias con etiquetas
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()) // Más recientes primero
      .slice(0, 3);
      
    // Si no hay suficientes noticias con etiquetas, completamos con otras
    if (this.featuredNews.length < 3 && this.allNews.length >= 3) {
      const remaining = this.allNews
        .filter(news => !this.featuredNews.includes(news))
        .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
        .slice(0, 3 - this.featuredNews.length);
        
      this.featuredNews = [...this.featuredNews, ...remaining];
    }
  }
}