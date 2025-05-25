import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { News } from '../../interfaces/news.interface';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.css']
})
export class NewsCardComponent {
  @Input() news!: News;
  
  // Limitar el número de etiquetas a mostrar
  getDisplayTags(): string[] {
    if (!this.news.tags || this.news.tags.length === 0) {
      return [];
    }
    
    // Mostrar máximo 2 etiquetas
    return this.news.tags.slice(0, 2);
  }
}