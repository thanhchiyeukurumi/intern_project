import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // **** Thêm DatePipe ****
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule, NzModalService} from 'ng-zorro-antd/modal';
import { PostService } from '../../../../core/services/post.service'; // Đảm bảo đường dẫn đúng
import { Post } from '../../../../shared/models/post.model'; // Đảm bảo đường dẫn đúng
import { NzMessageService } from 'ng-zorro-antd/message'; // Import MessageService nếu muốn thông báo lỗi

@Component({
  selector: 'app-admin-post',
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
    NzAvatarModule,
    NzTagModule,
    NzPaginationModule,
    NzEmptyModule,
    DatePipe,
    NzModalModule
  ],
  providers: [
  ],
  templateUrl: './admin-post.component.html',
  styleUrls: ['./admin-post.component.css']
})
export class AdminPostComponent implements OnInit {
  // ============================================ 
  // **Biến trạng thái và thuộc tính**
  // ============================================
  searchValue = '';
  selectedCategory = ''; 
  selectedDate = null;
  displayData: Post[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();

  pageIndex = 1;
  pageSize = 5;
  total = 0;
  loading = false;

  // ============================================ 
  // **Constructor**
  // ============================================
  /**
   * Khởi tạo component, inject các service cần thiết
   * @param postService Service thao tác với bài viết
   * @param message Service hiển thị thông báo
   * @param modalService Service hiển thị modal xác nhận
   */
  constructor(
      private postService: PostService,
      private message: NzMessageService,
      private modalService: NzModalService
  ) {}

  // ============================================ 
  // **Lifecycle Hooks**
  // ============================================
  /**
   * Hàm khởi tạo khi component được mount
   */
  ngOnInit(): void {
    this.fetchPosts();
  }

  // ============================================ 
  // **Hàm lấy danh sách bài viết**
  // ============================================
  /**
   * Lấy danh sách bài viết từ API
   */
  fetchPosts(): void {
    this.loading = true;
    this.setOfCheckedId.clear();
    this.refreshCheckedStatus(); 

    this.postService.getAll({
      page: this.pageIndex,
      limit: this.pageSize,
      search: this.searchValue || undefined,
      includeRelations: true,
    }).subscribe({
      next: (res) => {
        this.displayData = res.data || [];
        this.total = res.pagination?.total || 0;
        this.loading = false;
        this.refreshCheckedStatus();
      },
      error: (err) => {
        console.error("Error fetching posts:", err);
        this.message.error("Failed to load posts. Please try again.");
        this.displayData = [];
        this.total = 0;
        this.loading = false;
      }
    });
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
    this.fetchPosts();
  }

  /**
   * Xử lý khi thay đổi số lượng item/trang
   * @param size Số lượng mới
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.fetchPosts();
  }

  // ============================================ 
  // **Tìm kiếm và lọc**
  // ============================================
  /**
   * Tìm kiếm và lọc bài viết
   */
  searchAndFilter(): void {
    this.pageIndex = 1;
    this.fetchPosts();
  }

  // ============================================ 
  // **Xử lý checkbox chọn nhiều**
  // ============================================
  /**
   * Xử lý khi chọn 1 item
   * @param id ID bài viết
   * @param checked Trạng thái chọn
   */
  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  /**
   * Xử lý khi chọn tất cả
   * @param checked Trạng thái chọn tất cả
   */
  onAllChecked(checked: boolean): void {
    this.displayData.forEach(item => this.updateCheckedSet(item.id, checked));
    this.refreshCheckedStatus();
  }

  /**
   * Cập nhật set các ID đã chọn
   * @param id ID bài viết
   * @param checked Trạng thái chọn
   */
  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  /**
   * Làm mới trạng thái checkbox header
   */
  refreshCheckedStatus(): void {
    const listOfEnabledDataOnPage = this.displayData;
    this.checked = listOfEnabledDataOnPage.length > 0 && listOfEnabledDataOnPage.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledDataOnPage.length > 0 && listOfEnabledDataOnPage.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  // ============================================ 
  // **Hàm hỗ trợ hiển thị**
  // ============================================
  /**
   * Lấy màu cho category
   * @param categoryName Tên category
   * @returns Màu sắc
   */
  getCategoryColor(categoryName: string | undefined): string {
    switch (categoryName) {
      case 'Công nghệ': return 'blue';
      case 'Technology': return 'blue';
      case 'Development': return 'green';
      case 'Phần mềm': return 'geekblue';
      case 'Design': return 'purple';
      case 'Trí tuệ nhân tạo': return 'cyan'; // Ví dụ
      default: return 'default';
    }
  }

  /**
   * Lấy avatar tác giả
   * @param avatarUrl Đường dẫn avatar
   * @returns Đường dẫn avatar hoặc placeholder
   */
  getAuthorAvatar(avatarUrl: string | null | undefined): string {
    return avatarUrl || 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'; // Placeholder
  }

  /**
   * Lấy thông tin phân trang dạng text
   * @returns Chuỗi mô tả phân trang
   */
  getPaginationInfo(): string {
    if (this.total === 0) return 'Showing 0 posts';
    const startIndex = (this.pageIndex - 1) * this.pageSize + 1;
    const endIndex = Math.min(startIndex + this.pageSize - 1, this.total);
    const displayStartIndex = Math.min(startIndex, this.total);
    return `Showing <strong>${displayStartIndex}</strong> to <strong>${endIndex}</strong> of <strong>${this.total}</strong> posts`;
  }

  // ============================================ 
  // **Xác nhận và xóa bài viết**
  // ============================================
  /**
   * Hiển thị modal xác nhận xóa bài viết
   * @param post Bài viết cần xóa
   */
  confirmDeletePost(post: Post): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận xóa bài viết', // Tiêu đề hộp thoại
      nzContent: `Bạn có chắc chắn muốn xóa bài viết <b>"${post.title}"</b> không?`, // Nội dung hộp thoại
      nzOkText: 'Xóa', // Text cho nút OK
      nzOkType: 'primary',
      nzOkDanger: true, // Nút OK màu đỏ
      nzCancelText: 'Hủy', // Text cho nút Cancel
      nzOnOk: () => { // Logic khi nhấn nút OK (async vì gọi service)
        console.log('Đã xác nhận xóa bài viết:', post.id);
        // Gọi API Service để xóa bài viết
        return new Promise((resolve, reject) => { // Sử dụng Promise để ng-zorro modal chờ kết quả
            this.postService.delete(post.id).subscribe({
              next: () => {
                console.log('Xóa thành công qua API');
                this.message.success(`Đã xóa bài viết "${post.title}"`); // Thông báo thành công
                this.deletePostFromList(post.id); // Xóa khỏi mảng hiển thị local
                resolve(true); // Đóng modal xác nhận
              },
              error: (error) => {
                console.error('Lỗi khi xóa bài viết:', error);
                this.message.error(`Không thể xóa bài viết "${post.title}". Vui lòng thử lại.`); // Thông báo lỗi
                reject(false); // Giữ modal mở (hoặc đóng tùy logic UX)
              }
            });
        });
      },
      nzOnCancel: () => { // Logic khi nhấn nút Cancel
        console.log('Đã hủy xóa');
      }
    });
  }

  /**
   * Xóa bài viết khỏi danh sách hiển thị local và cập nhật lại danh sách
   * @param postId ID bài viết cần xóa
   */
  deletePostFromList(postId: number): void {
      // Lọc ra bài viết có ID cần xóa
      this.displayData = this.displayData.filter(item => item.id !== postId);
      // Cập nhật tổng số item (giả sử API trả về total mới hoặc bạn tính lại)
      // Một cách khác là fetchPosts() lại sau khi xóa thành công để lấy dữ liệu mới và total mới
      // this.total = this.total - 1; // Cập nhật tổng số item thủ công (có thể không chính xác nếu có paging)
      // Nên fetchPosts() lại sau khi xóa để đảm bảo dữ liệu và paging đúng
      this.fetchPosts();

      // Cập nhật trạng thái checkbox
      this.setOfCheckedId.delete(postId); // Đảm bảo xóa khỏi set selected nếu đang được chọn
      this.refreshCheckedStatus(); // Cập nhật trạng thái checkbox header
  }

}


