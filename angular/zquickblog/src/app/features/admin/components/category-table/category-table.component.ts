import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { Category } from '../../../../shared/models/category.model';

@Component({
  selector: 'app-category-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule
  ],
  templateUrl: './category-table.component.html',
  styleUrls: ['./category-table.component.css']
})
export class CategoryTableComponent {
  @Input() categories: Category[] = [];
  @Input() loading = false;
  @Input() parentCategories: Category[] = [];

  // Thêm Input cho trạng thái checked
  @Input() checked = false;
  @Input() indeterminate = false;
  @Input() setOfCheckedId = new Set<number>();

  @Output() edit = new EventEmitter<Category>();
  @Output() delete = new EventEmitter<Category>();
  @Output() checkAll = new EventEmitter<boolean>();
  @Output() checkItem = new EventEmitter<{id: number, checked: boolean}>();

  /**
   * Xử lý khi checkbox của tất cả các mục thay đổi
   */
  onAllChecked(checked: boolean): void {
    this.checkAll.emit(checked);
  }

  /**
   * Xử lý khi checkbox của một mục thay đổi
   */
  onItemChecked(id: number, checked: boolean): void {
    this.checkItem.emit({id, checked});
  }

  /**
   * Xử lý khi nhấn nút Edit
   */
  onEdit(category: Category): void {
    this.edit.emit(category);
  }

  /**
   * Xử lý khi nhấn nút Delete
   */
  onDelete(category: Category): void {
    this.delete.emit(category);
  }

  /**
   * Lấy tên danh mục cha dựa vào parent_id
   */
  getParentCategoryName(parentId: number | null | undefined): string {
    if (parentId === null || parentId === undefined) {
      return '-';
    }
    
    const numericParentId = Number(parentId);
    const parentCat = this.parentCategories.find(cat => cat.id === numericParentId);
    
    return parentCat ? parentCat.name : `Không xác định (${parentId})`;
  }
} 