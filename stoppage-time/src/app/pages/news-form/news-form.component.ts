import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { AuthService } from '../../services/auth.service';
import { News } from '../../interfaces/news.interface';

// Importaciones de Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-news-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    // Angular Material
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './news-form.component.html',
  styleUrls: ['./news-form.component.css']
})
export class NewsFormComponent implements OnInit {
  newsForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  isEditing = false;
  newsId = '';

  // Opciones predefinidas de etiquetas
  tagOptions: string[] = [
    'Liga MX', 'Premier League', 'La Liga', 'Ligue 1', 'Bundesliga', 'Serie A', 
    'Champions League', 'Mundial 2026', 'Eurocopa 2024', 'UEFA', 'FIFA'
  ];
  
  selectedTags: string[] = [];

  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario es administrador
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/news']);
      return;
    }

    // Inicializar formulario
    this.initForm();

    // Verificar si estamos editando una noticia existente
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditing = true;
        this.newsId = id;
        this.loadNewsDetails(id);
      }
    });
  }

  initForm(): void {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      summary: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      image: ['', [Validators.required, Validators.pattern('https?://.+')]],
      tags: ['']
    });
  }

  loadNewsDetails(id: string): void {
    this.newsService.getNewsById(id).subscribe(
      news => {
        // Establecer valores del formulario
        this.newsForm.patchValue({
          title: news.title,
          summary: news.summary,
          content: news.content,
          image: news.image
        });
        
        // Establecer etiquetas seleccionadas
        this.selectedTags = [...news.tags];
      },
      error => {
        console.error('Error al cargar los detalles de la noticia:', error);
        this.snackBar.open('No se pudo cargar la noticia', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    );
  }

  toggleTag(tag: string): void {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    } else {
      this.selectedTags.push(tag);
    }
  }

  addCustomTag(): void {
    const tagInput = this.newsForm.get('tags')?.value;
    if (tagInput && tagInput.trim() !== '' && !this.selectedTags.includes(tagInput)) {
      this.selectedTags.push(tagInput);
      this.newsForm.get('tags')?.setValue('');
    }
  }

  removeTag(tag: string): void {
    this.selectedTags = this.selectedTags.filter(t => t !== tag);
  }

  onSubmit(): void {
    if (this.newsForm.invalid || this.selectedTags.length === 0) {
      // Marcar todos los campos como tocados para activar los mensajes de validación
      Object.keys(this.newsForm.controls).forEach(key => {
        this.newsForm.get(key)?.markAsTouched();
      });
      
      if (this.selectedTags.length === 0) {
        this.errorMessage = 'Debes seleccionar al menos una etiqueta.';
      }
      
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = this.newsForm.value;
    const newsData: Partial<News> = {
      title: formData.title,
      summary: formData.summary,
      content: formData.content,
      image: formData.image,
      tags: this.selectedTags,
      publishDate: new Date()
    };

    if (this.isEditing) {
      this.updateNews(newsData);
    } else {
      this.createNews(newsData as Omit<News, 'id'>);
    }
  }

  createNews(newsData: Omit<News, 'id'>): void {
    this.newsService.createNews(newsData).subscribe(
      (createdNews) => {
        this.isSubmitting = false;
        this.snackBar.open('Noticia creada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/news', createdNews.id]);
      },
      (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Error al crear la noticia. Inténtalo de nuevo.';
        console.error('Error al crear la noticia:', error);
      }
    );
  }

  updateNews(newsData: Partial<News>): void {
    this.newsService.updateNews(this.newsId, newsData).subscribe(
      (updatedNews) => {
        this.isSubmitting = false;
        this.snackBar.open('Noticia actualizada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/news', updatedNews.id]);
      },
      (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Error al actualizar la noticia. Inténtalo de nuevo.';
        console.error('Error al actualizar la noticia:', error);
      }
    );
  }
}