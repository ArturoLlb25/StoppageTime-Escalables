import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Inicio - StoppageTime'
  },
  {
    path: 'matches',
    loadComponent: () => import('./pages/matches/matches.component').then(m => m.MatchesComponent),
    title: 'Partidos - StoppageTime'
  },
  {
    path: 'matches/:id',
    loadComponent: () => import('./pages/match-details/match-details.component').then(m => m.MatchDetailsComponent),
    title: 'Detalles del Partido - StoppageTime'
  },
  {
    path: 'news',
    loadComponent: () => import('./pages/news/news.component').then(m => m.NewsComponent),
    title: 'Noticias - StoppageTime'
  },
  {
    path: 'news/new',
    loadComponent: () => import('./pages/news-form/news-form.component').then(m => m.NewsFormComponent),
    title: 'Nueva Noticia - StoppageTime',
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'news/edit/:id',
    loadComponent: () => import('./pages/news-form/news-form.component').then(m => m.NewsFormComponent),
    title: 'Editar Noticia - StoppageTime',
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'news/:id',
    loadComponent: () => import('./pages/news-details/news-details.component').then(m => m.NewsDetailsComponent),
    title: 'Detalles de Noticia - StoppageTime'
  },
    {
      path: 'statistics',
      loadComponent: () => import('./pages/statistics/statistics.component').then(m => m.StatisticsComponent),
      title: 'Estadísticas - StoppageTime'
    },
   {
     path: 'login',
     loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
     title: 'Iniciar Sesión - StoppageTime'
   },
   {
     path: 'register',
     loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
     title: 'Registro - StoppageTime'
   },
   {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Perfil - StoppageTime',
    canActivate: [authGuard]
  },
   {
     path: 'contact',
     loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
     title: 'Contacto - StoppageTime'
   },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Página no encontrada - StoppageTime'
  }
];