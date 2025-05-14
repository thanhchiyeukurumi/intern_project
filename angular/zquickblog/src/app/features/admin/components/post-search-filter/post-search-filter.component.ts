import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Category } from '../../../../shared/models/category.model';

@Component({
  selector: 'app-post-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule
  ],
  templateUrl: './post-search-filter.component.html',
  styleUrls: ['./post-search-filter.component.css']
})
export class PostSearchFilterComponent {
  @Input() categories: Category[] = [];
  @Input() searchValue = '';
  @Input() selectedCategory = '';
  @Input() selectedDate: 'today' | 'week' | 'month' | null = null;

  @Output() search = new EventEmitter<void>();
  @Output() searchValueChange = new EventEmitter<string>();
  @Output() selectedCategoryChange = new EventEmitter<string>();
  @Output() selectedDateChange = new EventEmitter<'today' | 'week' | 'month' | null>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() addNewPost = new EventEmitter<void>();

  onSearchChange(value: string): void {
    this.searchValue = value;
    this.searchValueChange.emit(value);
  }

  onCategoryChange(value: string): void {
    this.selectedCategory = value;
    this.selectedCategoryChange.emit(value);
  }

  onDateFilterChange(value: 'today' | 'week' | 'month' | null): void {
    this.selectedDate = value;
    this.selectedDateChange.emit(value);
  }

  onResetFilters(): void {
    this.resetFilters.emit();
  }

  onAddNewPost(): void {
    this.addNewPost.emit();
  }
} 