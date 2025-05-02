import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
// import { NzTableModule } from 'ng-zorro-antd/table'; // Không cần bảng cho cách hiển thị này
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { CommentService } from '../../../../core/services/comment.service'; // Correct Import
import { Comment } from '../../../../shared/models/comment.model'; // Correct Import, use the shared model
import { AuthService } from '../../../../core/services/auth.service';
import { switchMap, of } from 'rxjs'; // Import 'of'

@Component({
  selector: 'app-blogger-comments',
  templateUrl: './blogger-comments.component.html',
  styleUrls: ['./blogger-comments.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule, // Để dùng routerLink
    NzCardModule,
    // NzTableModule, // Loại bỏ import nếu không dùng bảng
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzPopconfirmModule,
    NzAvatarModule,
    NzInputModule,
    NzBadgeModule,
    NzTypographyModule,
    NzEmptyModule,
    NzPaginationModule,
    NzModalModule,
    DatePipe // Import DatePipe ở đây nếu dùng trong template
  ],
  // providers: [...] // Provider service ở app.config.ts
})
export class BloggerCommentsComponent implements OnInit {
  // ============================================
  // **Biến trạng thái và thuộc tính**
  // ============================================
  searchValue = ''; // Dùng cho search
  displayComments: Comment[] = []; // Dữ liệu hiển thị comment

  // Biến phân trang
  pageIndex = 1;
  pageSize = 10; 
  total = 0;
  loading = false;

  currentUser: any = null; // Thông tin user hiện tại (có thể dùng User | null nếu import User từ auth service)

  constructor(
    private commentService: CommentService, // Inject CommentService
    private message: NzMessageService,
    private modalService: NzModalService,
    private authService: AuthService, // Inject AuthService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true; // Bật loading ngay khi bắt đầu fetch

    // Lắng nghe sự thay đổi của user hiện tại
    this.authService.currentUser$.pipe(
        switchMap(user => {
            this.currentUser = user; // Cập nhật biến currentUser của component
            if (user && user.id) { // Kiểm tra user và user.id
                // **** Gọi API để lấy dữ liệu bình luận của user hiện tại ****
                // Khi user có, gọi API comment service
                return this.commentService.getByUser(user.id, {
                    page: this.pageIndex,
                    limit: this.pageSize,
                    // TODO: Thêm search param nếu API hỗ trợ
                    // search: this.searchValue || undefined,
                    orderBy: 'createdAt', // Sắp xếp theo ngày tạo
                    order: 'DESC',
                    // API getByUser/comments có include User (tác giả comment) và Post không?
                    // Nếu có, cần includeRelations: true (kiểm tra trong service backend)
                });
            } else {
                 // User chưa đăng nhập hoặc không có ID
                 // Thông báo và chuyển hướng
                 this.message.warning('Vui lòng đăng nhập để xem bình luận của bạn.');
                 this.router.navigate(['/login']); // Chuyển hướng về login
                 // Trả về Observable rỗng với cấu trúc dữ liệu phù hợp
                 // để đảm bảo khối subscribe không bị lỗi type và set loading = false
                return of({ data: [], pagination: { total: 0 } }); // TRẢ VỀ OF RỖNG VỚI CẤU TRÚC ĐÚNG
            }
        })
    ).subscribe({
      next: (res: { data: Comment[]; pagination: any }) => { // Sử dụng kiểu dữ liệu rõ ràng
        this.displayComments = res.data || [];
        this.total = res.pagination?.total || 0;
        this.loading = false; // Tắt loading khi có dữ liệu
        console.log('Fetched Comments:', this.displayComments); // Log để kiểm tra dữ liệu
      },
      error: (err) => {
        console.error("Error fetching blogger comments:", err);
         // Kiểm tra lỗi 401/403 và xử lý chuyển hướng nếu interceptor chưa đủ
        if (err.status === 401 || err.status === 403) {
             // Interceptor thường xử lý điều này, nhưng thêm ở đây là an toàn
             this.router.navigate(['/login']);
             this.message.error('Phiên làm việc đã hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.');
        } else {
             this.message.error("Failed to load your comments. Please try again.");
        }
        this.displayComments = [];
        this.total = 0;
        this.loading = false; // Tắt loading khi có lỗi
      }
    });
  }

  // ============================================
  // **Hàm fetch comments (để gọi lại)**
  // ============================================
  /**
   * Lấy danh sách bình luận từ API dựa trên trạng thái hiện tại của component (paging, search)
   */
  fetchComments(): void {
       // Kiểm tra lại user trước khi fetch (phòng trường hợp subscribe chạy lại hoặc gọi thủ công)
       if (!this.currentUser || !this.currentUser.id) {
           // Nếu không có user, không làm gì cả, chỉ xóa dữ liệu cũ
           this.displayComments = [];
           this.total = 0;
           this.loading = false;
           // Có thể thêm log cảnh báo nếu hàm này bị gọi khi không có user
           console.warn('fetchComments called but currentUser is not available.');
           return;
       }

       this.loading = true; // Bật loading

       this.commentService.getByUser(this.currentUser.id, {
           page: this.pageIndex,
           limit: this.pageSize,
           orderBy: 'createdAt',
           order: 'DESC',
           // includeRelations: true (kiểm tra service backend)
       }).subscribe({
           next: (res) => {
               this.displayComments = res.data || [];
               this.total = res.pagination?.total || 0;
               this.loading = false; // Tắt loading khi thành công
           },
           error: (err) => {
               console.error("Error fetching comments:", err);
               const errorMessage = err?.error?.message || err?.message || "Failed to load comments.";
               this.message.error(errorMessage);
               this.displayComments = [];
               this.total = 0;
               this.loading = false; // Tắt loading khi có lỗi
                // Xử lý lỗi 401/403
               if (err.status === 401 || err.status === 403) {
                    this.router.navigate(['/login']);
               }
           }
       });
   }


  // ============================================
  // **Xử lý phân trang**
  // ============================================
  onPageIndexChange(index: number): void {
    if (index === this.pageIndex) return; // Tránh fetch lại nếu trang không đổi
    this.pageIndex = index;
    this.fetchComments();
  }

  onPageSizeChange(size: number): void {
    if (size === this.pageSize) return; // Tránh fetch lại nếu size không đổi
    this.pageSize = size;
    this.pageIndex = 1; // Reset về trang 1 khi thay đổi kích thước trang
    this.fetchComments();
  }

  // ============================================
  // **Tìm kiếm (Nếu API hỗ trợ)**
  // ============================================
  onSearch(): void {
    // Trim whitespace from search value
    const trimmedSearch = this.searchValue.trim();
    // Nếu API getByUser/comments có search param
    // Cập nhật searchValue (nếu dùng cho API) hoặc chỉ dùng trimmedSearch
     // TODO: Kiểm tra nếu searchValue trống sau trim, có cần reset không?
     this.pageIndex = 1; // Reset về trang 1 khi search
     this.fetchComments(); // Fetch dữ liệu với search param
    // Nếu search chỉ lọc local:
    // TODO: Implement local search logic on this.displayComments
    // this.message.info('Chức năng tìm kiếm bình luận đang được phát triển (cần API hỗ trợ hoặc lọc local).');
  }


  // ============================================
  // **Xóa Bình luận**
  // ============================================
  /**
   * Xác nhận và xóa bình luận
   * @param comment Bình luận cần xóa
   */
  confirmDeleteComment(comment: Comment): void {
    // Kiểm tra lại quyền xóa nếu cần (ví dụ: user hiện tại là tác giả comment)
    // if (!this.currentUser || comment.userId !== this.currentUser.id) {
    //     this.message.warning('Bạn không có quyền xóa bình luận này.');
    //     return;
    // }

    this.modalService.confirm({
      nzTitle: 'Xác nhận xóa bình luận',
      nzContent: `Bạn có chắc chắn muốn xóa bình luận này không?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        console.log('Đã xác nhận xóa bình luận:', comment.id);
        this.loading = true; // Bật loading

        // Gọi API Service để xóa bình luận
        // Promise được dùng ở đây để NzModal biết khi nào modal có thể đóng lại (sau khi observable hoàn thành)
        return new Promise<void>((resolve, reject) => { // Dùng void vì không cần trả về giá trị cụ thể
            // Cast comment.id sang number nếu API service cần number
            this.commentService.delete(comment.id as number).subscribe({
              next: () => {
                console.log('Xóa thành công qua API:', comment.id);
                this.message.success(`Đã xóa bình luận.`);
                this.deleteCommentFromList(comment.id as number); // Cập nhật UI local
                resolve(); // Kết thúc Promise thành công -> đóng modal
              },
              error: (error) => {
                console.error('Lỗi khi xóa bình luận:', comment.id, error);
                this.loading = false; // Tắt loading khi có lỗi
                 const errorMessage = error?.error?.message || error?.message || `Không thể xóa bình luận. Vui lòng thử lại.`;
                 this.message.error(errorMessage);
                reject(); // Kết thúc Promise với lỗi -> không đóng modal
                 // Xử lý lỗi 401/403
               if (error.status === 401 || error.status === 403) {
                   this.router.navigate(['/login']);
               }
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
   * Xóa bình luận khỏi danh sách hiển thị local và cập nhật lại danh sách (gọi fetchComments)
   * @param commentId ID bình luận cần xóa
   */
  deleteCommentFromList(commentId: number): void { // Sử dụng number nếu ID là number
      // Cách 1: Xóa local rồi gọi lại API (đảm bảo total và paging chính xác)
      this.fetchComments();
  }


  // ============================================
  // **Hàm hỗ trợ hiển thị**
  // ============================================

  /**
   * Lấy avatar tác giả comment
   * @param comment Đối tượng Comment (cần include User)
   * @returns Đường dẫn avatar hoặc placeholder
   */
   getAuthorAvatar(comment: Comment): string {
       // Kiểm tra nếu User object được include và có avatar
       if (comment.user && comment.user.avatar) {
           return comment.user.avatar;
       }
       return 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'; // Placeholder mặc định
   }

   /**
    * Lấy username tác giả comment
    * @param comment Đối tượng Comment (cần include User)
    * @returns Username hoặc placeholder
    */
   getAuthorUsername(comment: Comment): string {
      if (comment.user && comment.user.username) {
          return comment.user.username;
      }
      return 'Unknown User'; // Placeholder
   }

   /**
    * Lấy title bài viết comment
    * @param comment Đối tượng Comment (cần include Post)
    * @returns Title bài viết hoặc placeholder
    */
   getPostTitle(comment: Comment): string {
      if (comment.post && comment.post.title) {
          return comment.post.title;
      }
      return 'Unknown Post'; // Placeholder
   }

    /**
    * Lấy slug bài viết comment (để tạo link)
    * @param comment Đối tượng Comment (cần include Post)
    * @returns Slug bài viết hoặc undefined
    */
   getPostSlug(comment: Comment): string | undefined {
       if (comment.post && comment.post.slug) {
           return comment.post.slug;
       }
       return undefined;
   }


   /**
    * Lấy thông tin phân trang dạng text
    * @returns Chuỗi mô tả phân trang
    */
   getPaginationInfo(): string {
     if (this.total === 0) return 'Showing 0 comments';
     const startIndex = (this.pageIndex - 1) * this.pageSize + 1;
     const endIndex = Math.min(startIndex + this.pageSize - 1, this.total);
     const displayStartIndex = Math.min(startIndex, this.total);
     return `Showing <strong>${displayStartIndex}</strong> to <strong>${endIndex}</strong> of <strong>${this.total}</strong> comments`;
   }

}