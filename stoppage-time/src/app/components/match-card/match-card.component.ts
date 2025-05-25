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
    
    // Convertir la fecha y hora a objeto Date
    const matchDateTime = new Date(`${this.match.date}T${this.match.time}`);
    
    // Formatear la hora en formato 12h
    return matchDateTime.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
}