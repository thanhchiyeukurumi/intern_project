import { Component, OnInit } from '@angular/core';
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
    NzPaginationModule
  ],
  providers: [
  ],
  templateUrl: './admin-category.component.html',
  styleUrl: './admin-category.component.css' // Đảm bảo styleUrl đúng
})
export class AdminCategoryComponent implements OnInit {
  isFormVisible = false;
  categoryName = '';
  parentCategory: number | null = null;
  displayData: Category[] = [];
  listOfParentCategories: Category[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();

  pageIndex = 1;
  pageSize = 5; 
  total = 0;
  loading = false;
  searchValue = ''; 

  // ============================================
  // **Constructor**
  // ============================================
  constructor(
    private categoryService: CategoryService, // Inject CategoryService
    private message: NzMessageService,
    private modalService: NzModalService
  ) {}

  // ============================================
  // **Lifecycle Hooks**
  // ============================================
  ngOnInit(): void {
    this.fetchCategories();
  }

  // ============================================
  // **Hàm lấy danh sách Category**
  // ============================================
  /**
   * Lấy danh sách category từ API (có phân trang nếu API hỗ trợ)
   */
  fetchCategories(): void {
    this.loading = true;
    this.setOfCheckedId.clear();
    this.refreshCheckedStatus();

    // Sử dụng API getAll có paging
    this.categoryService.getAll({
        page: this.pageIndex,
        limit: this.pageSize,
        search: this.searchValue || undefined, // Thêm search param
        orderBy: 'name', // Sắp xếp theo tên mặc định
        order: 'ASC'
    }).subscribe({
      next: (res) => {
        // API trả về { data: Category[], pagination: any }
        this.displayData = res.data || [];
        this.total = res.pagination?.total || 0;
        this.loading = false;
        this.refreshCheckedStatus();
      },
      error: (err) => {
        console.error("Error fetching categories:", err);
        this.message.error("Failed to load categories. Please try again.");
        this.displayData = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

   /**
    * Lấy danh sách category (thường là dạng phẳng, không paging) cho select parent
    */
   fetchParentCategories(): void {
       this.categoryService.getAll({limit: 1000}).subscribe({ // Lấy tất cả hoặc số lượng đủ lớn
           next: (res) => {
               // Lọc bỏ category đang chỉnh sửa nếu đây là form update
               this.listOfParentCategories = res.data || [];
           },
           error: (err) => {
               console.error("Error fetching parent categories:", err);
               // Xử lý lỗi
           }
       });
   }


  // ============================================
  // **Form Thêm Category**
  // ============================================
  showForm(): void {
    this.isFormVisible = true;
    this.resetForm(); // Reset form khi hiển thị
    this.fetchParentCategories(); // Load danh sách parent khi mở form
  }

  hideForm(): void {
    this.isFormVisible = false;
    this.resetForm();
  }

  resetForm(): void {
    this.categoryName = '';
    this.parentCategory = null; // Reset về null
  }

  addCategory(): void {
    if (!this.categoryName.trim()) {
        this.message.warning('Vui lòng nhập tên danh mục.');
        return;
    }

    this.loading = true; // Bật loading khi gọi API

    const newCategoryData = {
        name: this.categoryName.trim(),
        parent_id: this.parentCategory // Gửi parent_id (number | null)
    };

    this.categoryService.create(newCategoryData).subscribe({
        next: (createdCategory) => {
            console.log('Category created:', createdCategory);
            this.message.success('Danh mục đã được tạo thành công.');
            this.hideForm(); // Ẩn form sau khi tạo thành công
            this.fetchCategories(); // Load lại danh sách để thấy category mới
        },
        error: (err) => {
            console.error("Error creating category:", err);
            this.loading = false; // Tắt loading
            // Xử lý lỗi cụ thể từ backend (vd: trùng tên)
            const errorMessage = err?.error?.message || err?.message || 'Không thể tạo danh mục.';
            this.message.error(errorMessage);
        }
    });
  }

  // ============================================
  // **Xóa Category**
  // ============================================
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
        // Gọi API Service để xóa danh mục
        return new Promise((resolve, reject) => { // Sử dụng Promise để modal chờ kết quả
            this.categoryService.delete(category.id).subscribe({
              next: () => {
                console.log('Xóa thành công qua API');
                this.message.success(`Đã xóa danh mục "${category.name}"`);
                this.deleteCategoryFromList(category.id); // Xóa khỏi mảng hiển thị local
                resolve(true); // Đóng modal
              },
              error: (error) => {
                console.error('Lỗi khi xóa danh mục:', error);
                const errorMessage = error?.error?.message || error?.message || `Không thể xóa danh mục "${category.name}". Vui lòng thử lại.`;
                 this.message.error(errorMessage);
                reject(false); // Giữ modal mở hoặc đóng tùy ý
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
     * Xóa category khỏi danh sách hiển thị local và cập nhật lại danh sách
     * @param categoryId ID category cần xóa
     */
    deleteCategoryFromList(categoryId: number): void {
        // Lọc ra category có ID cần xóa
        this.displayData = this.displayData.filter(item => item.id !== categoryId);
        // Gọi lại API để đảm bảo paging và tổng số item chính xác
        this.fetchCategories();

        // Cập nhật trạng thái checkbox
        this.setOfCheckedId.delete(categoryId);
        this.refreshCheckedStatus();
    }


  // ============================================
  // **Checkbox**
  // ============================================
  // Giữ nguyên logic checkbox từ AdminPostComponent
  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.displayData.forEach(item => this.updateCheckedSet(item.id, checked));
    this.refreshCheckedStatus();
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  refreshCheckedStatus(): void {
    const listOfEnabledDataOnPage = this.displayData;
    this.checked = listOfEnabledDataOnPage.length > 0 && listOfEnabledDataOnPage.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledDataOnPage.length > 0 && listOfEnabledDataOnPage.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  // ============================================
  // **Hàm hỗ trợ hiển thị**
  // ============================================

  /**
   * Lấy thông tin parent category dựa vào parent_id
   * @param parentId parent_id từ API
   * @returns Tên parent category hoặc '-'
   */
  getParentCategoryName(parentId: number | null | undefined): string {
      if (parentId === null) {
          return '-';
      }
      // Tìm category trong danh sách đầy đủ (listOfParentCategories) dựa vào parentId
      const parentCat = this.listOfParentCategories.find(cat => cat.id === parentId);
      return parentCat ? parentCat.name : 'Unknown Parent'; // Trả về tên hoặc báo Unknown
  }


   // Hàm getPaginationInfo tương tự Post Component (nếu API Category có paging)
   getPaginationInfo(): string {
     if (this.total === 0) return 'Showing 0 categories';
     const startIndex = (this.pageIndex - 1) * this.pageSize + 1;
     const endIndex = Math.min(startIndex + this.pageSize - 1, this.total);
     const displayStartIndex = Math.min(startIndex, this.total);
     return `Showing <strong>${displayStartIndex}</strong> to <strong>${endIndex}</strong> of <strong>${this.total}</strong> categories`;
   }

     // ============================================ 
  // **Xử lý phân trang**
  // ============================================
  /**
   * Xử lý khi chuyển trang
   * @param index Số trang mới
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.fetchCategories();
  }

  /**
   * Xử lý khi thay đổi số lượng item/trang
   * @param size Số lượng mới
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.fetchCategories();
  }
}