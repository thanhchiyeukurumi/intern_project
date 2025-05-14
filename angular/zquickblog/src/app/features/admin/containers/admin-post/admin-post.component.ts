import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzModalModule, NzModalService} from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PostService } from '../../../../core/services/post.service';
import { Post } from '../../../../shared/models/post.model';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../shared/models/category.model';
import { PostTableComponent } from '../../components/post-table/post-table.component';
import { PostSearchFilterComponent } from '../../components/post-search-filter/post-search-filter.component';
import { AdminPaginationComponent } from '../../components/admin-pagination/admin-pagination.component';

@Component({
  selector: 'app-admin-post',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzModalModule,
    PostTableComponent,
    PostSearchFilterComponent,
    AdminPaginationComponent
  ],
  providers: [],
  templateUrl: './admin-post.component.html',
  styleUrl: './admin-post.component.css'
})
export class AdminPostComponent implements OnInit {
  // ============================================ 
  // **Properties/Biến**
  // ============================================
  // Common properties
  loading = false;
  
  // Search & Filter properties
  searchValue = '';
  selectedCategory = ''; 
  selectedDate: 'today' | 'week' | 'month' | null = null;
  categories: Category[] = [];
  
  // Table properties
  displayData: Post[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();
  
  // Pagination properties
  pageIndex = 1;
  pageSize = 5;
  total = 0;

  // ============================================ 
  // **Constructor**
  // ============================================
  constructor(
    private postService: PostService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  // ============================================ 
  // **Lifecycle Hooks**
  // ============================================
  ngOnInit(): void {
    this.fetchCategories();
    this.fetchPosts();
  }

  // ============================================ 
  // **Data Fetching - API Calls**
  // ============================================
  /**
   * Lấy danh sách danh mục từ API
   */
  fetchCategories(): void {
    this.categoryService.getAll({limit: 100}).subscribe({
      next: (res) => {
        this.categories = res.data || [];
      },
      error: (err) => {
        console.error("Error fetching categories:", err);
        this.message.error("Không thể tải danh sách danh mục");
      }
    });
  }

  /**
   * Lấy danh sách bài viết từ API
   */
  fetchPosts(): void {
    this.loading = true;
    this.setOfCheckedId.clear();
    this.refreshCheckedStatus(); 

    // Tham số cơ bản cho API
    const baseParams = {
      page: this.pageIndex,
      limit: this.pageSize,
      includeRelations: true,
    };

    // Tham số tìm kiếm
    const searchTerm = this.searchValue && this.searchValue.trim() !== '' ? this.searchValue.trim() : undefined;

    // Nếu chỉ có lọc theo danh mục, sử dụng getByCategory
    if (this.selectedCategory && !this.selectedDate) {
      console.log('Using getByCategory with categoryId:', this.selectedCategory);
      
      // getByCategory không hỗ trợ tìm kiếm, nên nếu có tìm kiếm phải sử dụng getAll
      if (searchTerm) {
        console.log('Search term with category, using getAll instead:', searchTerm);
        
        const params = {
          ...baseParams,
          search: searchTerm,
          categoryId: this.selectedCategory
        };
        
        this.postService.getAll(params).subscribe(this.handleApiResponse());
      } else {
        this.postService.getByCategory(this.selectedCategory, {
          ...baseParams
        }).subscribe(this.handleApiResponse());
      }
    }
    // Nếu có lọc theo thời gian, sử dụng getPostsByDateRange
    else if (this.selectedDate) {
      const today = new Date();
      let startDate: Date | null = null;
      
      switch(this.selectedDate) {
        case 'today':
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
          break;
        case 'week':
          // Lấy ngày đầu tuần (thứ 2)
          const day = today.getDay();
          const diff = today.getDate() - day + (day === 0 ? -6 : 1);
          startDate = new Date(today.getFullYear(), today.getMonth(), diff, 0, 0, 0);
          break;
        case 'month':
          // Lấy ngày đầu tháng
          startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
          break;
      }
      
      console.log('Using date filter with startDate:', startDate?.toISOString());
      
      // Do getPostsByDateRange không hỗ trợ tốt phân trang và tìm kiếm,
      // chúng ta sử dụng getAll với tham số startDate
      const params: any = {
        ...baseParams,
        startDate: startDate?.toISOString()
      };
      
      // Thêm categoryId nếu có
      if (this.selectedCategory) {
        params.categoryId = this.selectedCategory;
      }
      
      // Thêm tham số tìm kiếm nếu có
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      console.log('Using getAll with date filters:', params);
      this.postService.getAll(params).subscribe(this.handleApiResponse());
    } 
    // Nếu không có bộ lọc nào đặc biệt, sử dụng getAll
    else {
      console.log('Using getAll with standard filters');
      
      const params: any = {
        ...baseParams
      };
      
      // Thêm tham số tìm kiếm nếu có
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      this.postService.getAll(params).subscribe(this.handleApiResponse());
    }
  }
  
  /**
   * Tạo handler cho response API để tái sử dụng
   * @returns Object handler cho các API call
   */
  private handleApiResponse() {
    return {
      next: (res: any) => {
        this.displayData = res.data || [];
        this.total = res.pagination?.total || 0;
        this.loading = false;
        this.refreshCheckedStatus();
      },
      error: (err: any) => this.handleApiError(err)
    };
  }
  
  /**
   * Xử lý lỗi từ API
   * @param err Error object
   */
  private handleApiError(err: any): void {
    console.error("Error fetching posts:", err);
    this.message.error("Không thể tải danh sách bài viết. Vui lòng thử lại sau.");
    this.displayData = [];
    this.total = 0;
    this.loading = false;
  }

  // ============================================ 
  // **PostSearchFilter Component Methods**
  // ============================================
  /**
   * Tìm kiếm và lọc bài viết
   */
  searchAndFilter(): void {
    // Reset về trang đầu tiên khi thực hiện tìm kiếm/lọc
    this.pageIndex = 1;
    this.fetchPosts();
  }

  /**
   * Xử lý khi thay đổi giá trị tìm kiếm
   */
  onSearchValueChange(value: string): void {
    this.searchValue = value;
  }

  /**
   * Xử lý khi thay đổi danh mục
   */
  onSelectedCategoryChange(value: string): void {
    this.selectedCategory = value;
    this.searchAndFilter();
  }

  /**
   * Xử lý khi thay đổi bộ lọc thời gian
   */
  onSelectedDateChange(value: 'today' | 'week' | 'month' | null): void {
    this.selectedDate = value;
    this.searchAndFilter();
  }

  /**
   * Reset tất cả bộ lọc về mặc định
   */
  resetFilters(): void {
    this.searchValue = '';
    this.selectedCategory = '';
    this.selectedDate = null;
    this.pageIndex = 1;
    this.fetchPosts();
  }

  /**
   * Điều hướng đến trang tạo bài viết mới
   */
  navigateToCreatePost(): void {
    this.router.navigate(['/blogger/posts/create']);
  }

  // ============================================ 
  // **PostTable Component Methods**
  // ============================================
  /**
   * Xử lý khi chọn 1 item
   */
  onItemChecked(event: {id: number, checked: boolean}): void {
    this.updateCheckedSet(event.id, event.checked);
    this.refreshCheckedStatus();
  }

  /**
   * Xử lý khi chọn tất cả
   */
  onAllChecked(checked: boolean): void {
    this.displayData.forEach(item => this.updateCheckedSet(item.id, checked));
    this.refreshCheckedStatus();
  }

  /**
   * Hiển thị modal xác nhận xóa bài viết
   */
  confirmDeletePost(post: Post): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận xóa bài viết',
      nzContent: `Bạn có chắc chắn muốn xóa bài viết <b>"${post.title}"</b> không?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        console.log('Đã xác nhận xóa bài viết:', post.id);
        return new Promise((resolve, reject) => {
            this.postService.delete(post.id).subscribe({
              next: () => {
                console.log('Xóa thành công qua API');
                this.message.success(`Đã xóa bài viết "${post.title}"`);
                this.deletePostFromList(post.id);
                resolve(true);
              },
              error: (error) => {
                console.error('Lỗi khi xóa bài viết:', error);
                this.message.error(`Không thể xóa bài viết "${post.title}". Vui lòng thử lại.`);
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
   * Xóa bài viết khỏi danh sách hiển thị local
   */
  deletePostFromList(postId: number): void {
    // Lọc ra bài viết có ID cần xóa
    this.displayData = this.displayData.filter(item => item.id !== postId);
    
    // Tính toán lại số lượng
    this.total = Math.max(0, this.total - 1);
    
    // Cập nhật trạng thái checkbox
    this.setOfCheckedId.delete(postId);
    this.refreshCheckedStatus();
  }

  // ============================================ 
  // **Checkbox Handling**
  // ============================================
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
    this.fetchPosts();
  }

  /**
   * Xử lý khi thay đổi số lượng item/trang
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1; // Reset về trang đầu khi thay đổi số lượng hiển thị
    this.fetchPosts();
  }
}


