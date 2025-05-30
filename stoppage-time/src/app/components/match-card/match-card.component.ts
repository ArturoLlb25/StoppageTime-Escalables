import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Match } from '../../interfaces/match.interface';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.css']
})
export class MatchCardComponent {
  @Input() match!: Match;

  formatMatchTime(): string {
    if (!this.match.date || !this.match.time) {
      return 'Horario por confirmar';
    }
    
    // Crear un objeto Date usando la fecha y hora
    try {
      const [year, month, day] = this.match.date.split('-').map(num => parseInt(num));
      const [hours, minutes] = this.match.time.split(':').map(num => parseInt(num));
      
      const matchDateTime = new Date(year, month - 1, day, hours, minutes);
      
      // Obtener fecha formateada en español
      const dateOptions: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric'
      };
      
      const formattedDate = matchDateTime.toLocaleDateString('es-MX', dateOptions);
      
      // Formatear la hora en formato local
      const formattedTime = matchDateTime.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      
      return `${formattedDate}, ${formattedTime}`;
    } catch (error) {
      console.error('Error al formatear la hora del partido:', error);
      return `${this.match.date} ${this.match.time}` || 'Horario por confirmar';
    }
  }

  getStatusClass(): string {
    if (!this.match) return '';
    
    switch (this.match.status) {
      case 'LIVE': return 'live';
      case 'SCHEDULED': return 'scheduled';
      case 'FINISHED': return 'finished';
      case 'CANCELED': return 'finished';
      default: return '';
    }
  }

  getStatusText(): string {
    if (!this.match) return '';
    
    switch (this.match.status) {
      case 'LIVE': return 'En vivo';
      case 'SCHEDULED': return 'Programado';
      case 'FINISHED': return 'Finalizado';
      case 'CANCELED': return 'Cancelado';
      default: return '';
    }
  }
}