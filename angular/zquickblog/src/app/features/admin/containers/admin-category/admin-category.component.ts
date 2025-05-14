import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message'; 
import { CategoryService } from '../../../../core/services/category.service'; 
import { Category } from '../../../../shared/models/category.model'; 
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';
import { CategoryTableComponent } from '../../components/category-table/category-table.component';
import { AdminPaginationComponent } from '../../components/admin-pagination/admin-pagination.component';

@Component({
  selector: 'app-admin-category',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzDropDownModule,
    NzModalModule,
    NzEmptyModule,
    NzPaginationModule,
    CategoryFormComponent,
    CategoryTableComponent,
    AdminPaginationComponent
  ],
  providers: [],
  templateUrl: './admin-category.component.html',
  styleUrl: './admin-category.component.css' 
})
export class AdminCategoryComponent implements OnInit {
  @ViewChild(CategoryFormComponent) categoryForm!: CategoryFormComponent;

  // ============================================
  // **Properties/Biến**
  // ============================================
  // Form properties
  isFormVisible = false;
  editMode = false;
  editingCategoryId: number | null = null;
  formTitle = 'Thêm danh mục mới';
  submitButtonText = 'Thêm danh mục';
  
  // Table properties
  displayData: Category[] = [];
  listOfParentCategories: Category[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();
  
  // Pagination properties
  pageIndex = 1;
  pageSize = 5; 
  total = 0;
  
  // Common properties
  loading = false;
  searchValue = ''; 

  constructor(
    private categoryService: CategoryService, 
    private message: NzMessageService,
    private modalService: NzModalService
  ){}

  // ============================================
  // **Lifecycle Hooks**
  // ============================================
  ngOnInit(): void {
    this.fetchCategories();
    this.fetchParentCategories();
  }

  // ============================================
  // **Data Fetching - API Calls**
  // ============================================
  /**
   * Lấy danh sách category từ API (có phân trang)
   */
  fetchCategories(): void {
    this.loading = true;
    this.setOfCheckedId.clear();
    this.refreshCheckedStatus();

    this.categoryService.getAll({
        page: this.pageIndex,
        limit: this.pageSize,
        search: this.searchValue || undefined,
        orderBy: 'name',
        order: 'ASC'
    }).subscribe({
      next: (res) => {
        this.displayData = res.data || [];
        this.total = res.pagination?.total || 0;
        this.loading = false;
        this.refreshCheckedStatus();
      },
      error: (err) => {
        console.error("Error fetching categories:", err);
        this.message.error("Không thể tải danh sách danh mục. Vui lòng thử lại.");
        this.displayData = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  /**
   * Lấy danh sách category cho select parent
   */
  fetchParentCategories(): void {
    this.categoryService.getAll({limit: 1000}).subscribe({
      next: (res) => {
        // Lọc bỏ category đang chỉnh sửa nếu đây là form update
        let categories = res.data || [];
        if (this.editMode && this.editingCategoryId) {
          categories = categories.filter((cat: Category) => cat.id !== this.editingCategoryId);
        }
        this.listOfParentCategories = categories;
      },
      error: (err) => {
        console.error("Error fetching parent categories:", err);
      }
    });
  }

  // ============================================
  // **CategoryForm Component Methods**
  // ============================================
  /**
   * Hiển thị form thêm mới danh mục
   */
  showForm(): void {
    this.isFormVisible = true;
    this.editMode = false;
    this.editingCategoryId = null;
    this.formTitle = 'Thêm danh mục mới';
    this.submitButtonText = 'Thêm danh mục';
    
    // Chỉ gọi fetchParentCategories khi danh sách rỗng
    if (this.listOfParentCategories.length === 0) {
      this.fetchParentCategories();
    }

    // Reset form nếu đã tạo component
    if (this.categoryForm) {
      this.categoryForm.resetForm();
    }
  }

  /**
   * Hiển thị form chỉnh sửa danh mục
   */
  showEditForm(category: Category): void {
    this.isFormVisible = true;
    this.editMode = true;
    this.editingCategoryId = category.id;
    this.formTitle = 'Chỉnh sửa danh mục';
    this.submitButtonText = 'Cập nhật danh mục';
    
    // Chỉ gọi fetchParentCategories khi cần
    if (this.listOfParentCategories.length === 0 || 
        this.listOfParentCategories.some(cat => cat.id === category.id)) {
      this.fetchParentCategories();
    }

    // Cập nhật form nếu đã tạo component
    if (this.categoryForm) {
      this.categoryForm.updateForm(category);
    }
  }

  /**
   * Ẩn form
   */
  hideForm(): void {
    this.isFormVisible = false;
    this.editMode = false;
    this.editingCategoryId = null;
  }

  /**
   * Xử lý khi form submit
   */
  handleFormSubmit(categoryData: {name: string; parent_id: number | null}): void {
    this.loading = true;
    
    if (this.editMode && this.editingCategoryId) {
      // Thực hiện cập nhật danh mục
      this.categoryService.update(this.editingCategoryId, categoryData).subscribe({
        next: (updatedCategory) => {
          console.log('Category updated:', updatedCategory);
          this.message.success('Danh mục đã được cập nhật thành công.');
          this.hideForm();
          
          // Thay vì gọi API, cập nhật local state
          const index = this.displayData.findIndex(item => item.id === this.editingCategoryId);
          if (index !== -1) {
            this.displayData[index] = {...this.displayData[index], ...categoryData};
          } else {
            // Nếu không tìm thấy trong dữ liệu hiện tại, mới gọi API
            this.fetchCategories();
          }
          
          this.loading = false;
        },
        error: (err) => {
          console.error("Error updating category:", err);
          this.loading = false;
          const errorMessage = err?.error?.message || err?.message || 'Không thể cập nhật danh mục.';
          this.message.error(errorMessage);
        }
      });
    } else {
      // Thực hiện thêm mới danh mục
      this.categoryService.create(categoryData).subscribe({
        next: (createdCategory) => {
          console.log('Category created:', createdCategory);
          this.message.success('Danh mục đã được tạo thành công.');
          this.hideForm();
          
          // Chỉ gọi API nếu đang ở trang đầu tiên, ngược lại cập nhật local state
          if (this.pageIndex === 1 && this.displayData.length < this.pageSize) {
            // Thêm vào đầu mảng dữ liệu hiện tại nếu hiện đang ở trang đầu tiên
            if (createdCategory && 'id' in createdCategory) {
              // Chuyển đổi sang kiểu Category
              const newCategory = createdCategory as Category;
              this.displayData = [newCategory, ...this.displayData];
              this.total++; // Tăng tổng số lượng
              this.refreshCheckedStatus();
            } else {
              // Nếu không có id, cần fetch lại data
              this.fetchCategories();
            }
          } else {
            // Gọi API để load lại dữ liệu
            this.pageIndex = 1; // Reset về trang đầu tiên
            this.fetchCategories();
          }
          
          this.loading = false;
        },
        error: (err) => {
          console.error("Error creating category:", err);
          this.loading = false;
          const errorMessage = err?.error?.message || err?.message || 'Không thể tạo danh mục.';
          this.message.error(errorMessage);
        }
      });
    }
  }

  // ============================================
  // **CategoryTable Component Methods**
  // ============================================
  /**
   * Xác nhận xóa danh mục
   */
  confirmDeleteCategory(category: Category): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận xóa danh mục',
      nzContent: `Bạn có chắc chắn muốn xóa danh mục <b>"${category.name}"</b> không?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        console.log('Đã xác nhận xóa danh mục:', category.id);
        return new Promise((resolve, reject) => {
            this.categoryService.delete(category.id).subscribe({
              next: () => {
                console.log('Xóa thành công qua API');
                this.message.success(`Đã xóa danh mục "${category.name}"`);
                this.deleteCategoryFromList(category.id);
                resolve(true);
              },
              error: (error) => {
                console.error('Lỗi khi xóa danh mục:', error);
                const errorMessage = error?.error?.message || error?.message || `Không thể xóa danh mục "${category.name}". Vui lòng thử lại.`;
                this.message.error(errorMessage);
                reject(false);
              }
            });
        });
      },
      nzOnCancel: () => {
        console.log('Đã hủy xóa');
      }
    });
  }

  /**
   * Xóa category khỏi danh sách hiển thị local
   */
  deleteCategoryFromList(categoryId: number): void {
    // Lọc ra category có ID cần xóa
    this.displayData = this.displayData.filter(item => item.id !== categoryId);
    
    // Tính toán lại số lượng
    this.total = Math.max(0, this.total - 1);
    
    // Chỉ gọi lại nếu trang hiện tại trống
    if (this.displayData.length === 0 && this.pageIndex > 1) {
      this.pageIndex--;
      this.fetchCategories();
    }

    // Cập nhật trạng thái checkbox
    this.setOfCheckedId.delete(categoryId);
    this.refreshCheckedStatus();
  }

  // ============================================
  // **Checkbox Handling**
  // ============================================
  /**
   * Xử lý khi checkbox "Select All" thay đổi
   */
  onAllChecked(checked: boolean): void {
    this.displayData.forEach(item => this.updateCheckedSet(item.id, checked));
    this.refreshCheckedStatus();
  }

  /**
   * Xử lý khi một checkbox item thay đổi
   */
  onItemChecked(event: {id: number, checked: boolean}): void {
    this.updateCheckedSet(event.id, event.checked);
    this.refreshCheckedStatus();
  }

  /**
   * Cập nhật tập hợp các ID đã chọn
   */
  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  /**
   * Làm mới trạng thái checkbox
   */
  refreshCheckedStatus(): void {
    const listOfEnabledDataOnPage = this.displayData;
    this.checked = listOfEnabledDataOnPage.length > 0 && listOfEnabledDataOnPage.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledDataOnPage.length > 0 && listOfEnabledDataOnPage.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  // ============================================
  // **AdminPagination Component Methods**
  // ============================================
  /**
   * Xử lý khi chuyển trang
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.fetchCategories();
  }

  /**
   * Xử lý khi thay đổi số lượng item/trang
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.fetchCategories();
  }

  // ============================================
  // **Helper Methods - Utility Functions**
  // ============================================
  /**
   * Lấy tên của danh mục cha dựa vào parent_id
   */
  getParentCategoryName(parentId: number | null | undefined): string {
    if (this.listOfParentCategories.length === 0) {
      return 'Loading...';
    }
    
    if (parentId === null || parentId === undefined) {
      return '-';
    }
    
    const numericParentId = Number(parentId);
    const parentCat = this.listOfParentCategories.find(cat => cat.id === numericParentId);
    
    return parentCat ? parentCat.name : `Unknown (${parentId})`; 
  }
}