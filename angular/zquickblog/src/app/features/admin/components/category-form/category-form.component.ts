import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Category } from '../../../../shared/models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule
  ],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  @Input() isVisible = false;
  @Input() formTitle = 'Thêm danh mục mới';
  @Input() submitButtonText = 'Thêm danh mục';
  @Input() editMode = false;
  @Input() loading = false;
  @Input() parentCategories: Category[] = [];
  @Input() editingCategoryId: number | null = null;

  @Output() formSubmit = new EventEmitter<{name: string; parent_id: number | null}>();
  @Output() formCancel = new EventEmitter<void>();

  categoryName = '';
  parentCategory: number | null = null;

  ngOnInit(): void {
    // Khởi tạo
  }

  /**
   * Reset form về trạng thái ban đầu
   */
  resetForm(): void {
    this.categoryName = '';
    this.parentCategory = null;
  }

  /**
   * Cập nhật giá trị form khi chỉnh sửa danh mục
   */
  updateForm(category: Category): void {
    this.categoryName = category.name;
    this.parentCategory = category.parent_id !== undefined ? category.parent_id : null;
  }

  /**
   * Xử lý khi submit form
   */
  onSubmit(): void {
    if (!this.categoryName.trim()) {
      // Validate có thể được thực hiện bởi component cha
      return;
    }

    this.formSubmit.emit({
      name: this.categoryName.trim(),
      parent_id: this.parentCategory
    });
  }

  /**
   * Xử lý khi hủy form
   */
  onCancel(): void {
    this.formCancel.emit();
  }
} 