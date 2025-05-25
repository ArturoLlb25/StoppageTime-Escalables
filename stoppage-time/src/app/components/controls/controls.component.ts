import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css']
})
export class ControlsComponent {
  @Input() showRefreshButton = true;
  @Output() searchEvent = new EventEmitter<string>();
  @Output() refreshEvent = new EventEmitter<void>();
  
  searchQuery = '';
  
  applyFilters(): void {
    this.searchEvent.emit(this.searchQuery);
  }
  
  clearSearch(): void {
    this.searchQuery = '';
    this.searchEvent.emit('');
  }
  
  refresh(): void {
    this.refreshEvent.emit();
  }
}