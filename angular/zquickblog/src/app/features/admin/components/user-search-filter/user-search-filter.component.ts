import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Role } from '../../../../shared/models/role.model';

@Component({
  selector: 'app-user-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule
  ],
  templateUrl: './user-search-filter.component.html',
  styleUrls: ['./user-search-filter.component.css']
})
export class UserSearchFilterComponent {
  @Input() searchValue = '';
  @Input() selectedRole: string | null = null;
  @Input() roles: Role[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() roleChange = new EventEmitter<string | null>();
  @Output() resetFiltersEvent = new EventEmitter<void>();
  
  /**
   * Phát sự kiện khi giá trị tìm kiếm thay đổi
   */
  onSearchChange(): void {
    this.searchChange.emit(this.searchValue);
  }

  /**
   * Phát sự kiện khi lựa chọn vai trò thay đổi
   */
  onRoleChange(): void {
    this.roleChange.emit(this.selectedRole);
  }

  /**
   * Reset tất cả bộ lọc
   */
  resetFilters(): void {
    this.searchValue = '';
    this.selectedRole = null;
    this.resetFiltersEvent.emit();
  }
} 