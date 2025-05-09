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
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CommentService } from '../../../../core/services/comment.service';
import { PostService } from '../../../../core/services/post.service';
import { Comment } from '../../../../shared/models/comment.model';
import { AuthService } from '../../../../core/services/auth.service';
import { switchMap, of, forkJoin } from 'rxjs';

@Component({
  selector: 'app-blogger-comments',
  templateUrl: './blogger-comments.component.html',
  styleUrls: ['./blogger-comments.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule, 
    NzCardModule,
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
    NzSpinModule,
    DatePipe
  ],
})
export class BloggerCommentsComponent implements OnInit {
  // ============================================
  // **Biến trạng thái và thuộc tính**
  // ============================================
  searchValue = '';
  displayComments: Comment[] = [];

  // Biến phân trang
  pageIndex = 1;
  pageSize = 10; 
  total = 0;
  loading = false;

  currentUser: any = null;
  userPosts: any[] = []; // Lưu danh sách bài viết của blogger

  constructor(
    private commentService: CommentService,
    private postService: PostService, // Thêm PostService để lấy bài viết của user
    private message: NzMessageService,
    private modalService: NzModalService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // Lắng nghe sự thay đổi của user hiện tại
    this.authService.currentUser$.pipe(
        switchMap(user => {
            this.currentUser = user;
            if (user && user.id) {
                // Đầu tiên lấy danh sách bài viết của user hiện tại
                return this.postService.getByUser(user.id, {
                    // Có thể thêm các tham số như cần
                    includeRelations: true,
                    // Lấy tất cả bài viết nếu có thể
                    limit: 1000 
                });
            } else {
                 this.message.warning('Vui lòng đăng nhập để xem bình luận của các bài viết của bạn.');
                 this.router.navigate(['/login']);
                 return of({ data: [], pagination: { total: 0 } });
            }
        }),
        switchMap(postsResponse => {
            // Lưu danh sách bài viết của user
            this.userPosts = postsResponse.data || [];
            
            if (this.userPosts.length === 0) {
                this.loading = false;
                this.message.info('Bạn chưa có bài viết nào.');
                return of({ data: [], pagination: { total: 0 } });
            }
            
            console.log(`Đã tìm thấy ${this.userPosts.length} bài viết của blogger`);
            
            // Nếu có quá nhiều bài viết, có thể cần xử lý phân trang hoặc giới hạn
            // Tạo mảng các request để lấy comment cho từng bài viết
            if (this.userPosts.length <= 5) {
                // Nếu có ít bài viết, lấy hết comment một lượt
                const commentRequests = this.userPosts.map(post => 
                    this.commentService.getByPost(post.id, {
                        page: this.pageIndex,
                        limit: this.pageSize,
                        orderBy: 'createdAt',
                        order: 'DESC'
                    })
                );
                
                // Thực hiện tất cả request đồng thời
                return forkJoin(commentRequests).pipe(
                    switchMap(responses => {
                        // Tổng hợp kết quả
                        const allComments: Comment[] = [];
                        let totalComments = 0;
                        
                        responses.forEach(response => {
                            allComments.push(...(response.data || []));
                            totalComments += response.pagination?.total || 0;
                        });
                        
                        // Sắp xếp lại theo thời gian
                        allComments.sort((a, b) => 
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        );
                        
                        // Giả lập phân trang ở client
                        const start = (this.pageIndex - 1) * this.pageSize;
                        const paginatedComments = allComments.slice(start, start + this.pageSize);
                        
                        return of({
                            data: paginatedComments,
                            pagination: { total: allComments.length }
                        });
                    })
                );
            } else {
                // Nếu có nhiều bài viết, lấy comments của 5 bài viết mới nhất
                const recentPosts = this.userPosts
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5);
                
                const commentRequests = recentPosts.map(post => 
                    this.commentService.getByPost(post.id, {
                        page: this.pageIndex,
                        limit: this.pageSize,
                        orderBy: 'createdAt',
                        order: 'DESC'
                    })
                );
                
                return forkJoin(commentRequests).pipe(
                    switchMap(responses => {
                        const allComments: Comment[] = [];
                        
                        responses.forEach(response => {
                            allComments.push(...(response.data || []));
                        });
                        
                        // Sắp xếp lại theo thời gian
                        allComments.sort((a, b) => 
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        );
                        
                        // Giả lập phân trang ở client
                        const start = (this.pageIndex - 1) * this.pageSize;
                        const paginatedComments = allComments.slice(start, start + this.pageSize);
                        
                        return of({
                            data: paginatedComments,
                            pagination: { total: allComments.length }
                        });
                    })
                );
            }
        })
    ).subscribe({
      next: (res: { data: Comment[]; pagination: any }) => {
        this.displayComments = res.data || [];
        this.total = res.pagination?.total || 0;
        this.loading = false;
        console.log('Fetched Comments for blogger posts:', this.displayComments);
      },
      error: (err) => {
        console.error("Error fetching comments for blogger posts:", err);
        if (err.status === 401 || err.status === 403) {
             this.router.navigate(['/login']);
             this.message.error('Phiên làm việc đã hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.');
        } else {
             this.message.error("Không thể tải bình luận cho bài viết của bạn. Vui lòng thử lại.");
        }
        this.displayComments = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  // ============================================
  // **Hàm fetch comments (để gọi lại)**
  // ============================================
  /**
   * Lấy danh sách bình luận từ API dựa trên trạng thái hiện tại của component
   */
  fetchComments(): void {
    if (!this.currentUser || !this.currentUser.id || this.userPosts.length === 0) {
        this.displayComments = [];
        this.total = 0;
        this.loading = false;
        console.warn('fetchComments called but userPosts is empty or currentUser is not available.');
        return;
    }

    this.loading = true;

    // Xử lý tương tự như trong ngOnInit
    if (this.userPosts.length <= 5) {
        const commentRequests = this.userPosts.map(post => 
            this.commentService.getByPost(post.id, {
                page: this.pageIndex,
                limit: this.pageSize,
                orderBy: 'createdAt',
                order: 'DESC'
            })
        );
        
        forkJoin(commentRequests).pipe(
            switchMap(responses => {
                const allComments: Comment[] = [];
                
                responses.forEach(response => {
                    allComments.push(...(response.data || []));
                });
                
                // Sắp xếp lại theo thời gian
                allComments.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                
                // Giả lập phân trang
                const start = (this.pageIndex - 1) * this.pageSize;
                const paginatedComments = allComments.slice(start, start + this.pageSize);
                
                return of({
                    data: paginatedComments,
                    pagination: { total: allComments.length }
                });
            })
        ).subscribe({
            next: (res) => {
                this.displayComments = res.data || [];
                this.total = res.pagination?.total || 0;
                this.loading = false;
            },
            error: (err) => {
                console.error("Error fetching comments:", err);
                const errorMessage = err?.error?.message || err?.message || "Failed to load comments.";
                this.message.error(errorMessage);
                this.displayComments = [];
                this.total = 0;
                this.loading = false;
                if (err.status === 401 || err.status === 403) {
                    this.router.navigate(['/login']);
                }
            }
        });
    } else {
        // Xử lý tương tự như trên với 5 bài viết mới nhất
        const recentPosts = this.userPosts
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
        
        const commentRequests = recentPosts.map(post => 
            this.commentService.getByPost(post.id, {
                page: this.pageIndex,
                limit: this.pageSize,
                orderBy: 'createdAt',
                order: 'DESC'
            })
        );
        
        forkJoin(commentRequests).pipe(
            switchMap(responses => {
                const allComments: Comment[] = [];
                
                responses.forEach(response => {
                    allComments.push(...(response.data || []));
                });
                
                // Sắp xếp lại theo thời gian
                allComments.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                
                // Giả lập phân trang
                const start = (this.pageIndex - 1) * this.pageSize;
                const paginatedComments = allComments.slice(start, start + this.pageSize);
                
                return of({
                    data: paginatedComments,
                    pagination: { total: allComments.length }
                });
            })
        ).subscribe({
            next: (res) => {
                this.displayComments = res.data || [];
                this.total = res.pagination?.total || 0;
                this.loading = false;
            },
            error: (err) => {
                console.error("Error fetching comments:", err);
                const errorMessage = err?.error?.message || err?.message || "Failed to load comments.";
                this.message.error(errorMessage);
                this.displayComments = [];
                this.total = 0;
                this.loading = false;
                if (err.status === 401 || err.status === 403) {
                    this.router.navigate(['/login']);
                }
            }
        });
    }
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
      if (comment.User.username) {
          return comment.User.username;
      }
      return 'Unknown User'; // Placeholder
   }

   /**
    * Lấy title bài viết comment
    * @param comment Đối tượng Comment (cần include Post)
    * @returns Title bài viết hoặc placeholder
    */
   getPostTitle(comment: Comment): string {
      if (comment.Post.title) {
          return comment.Post.title;
      }
      return 'Unknown Post'; // Placeholder
   }

    /**
    * Lấy slug bài viết comment (để tạo link)
    * @param comment Đối tượng Comment (cần include Post)
    * @returns Slug bài viết hoặc undefined
    */
   getPostSlug(comment: Comment): string | undefined {
       if (comment.Post.slug) {
           return comment.Post.slug;
       }
       return undefined;
   }

   /**
    * Lấy thông tin phân trang dạng text
    * @returns Chuỗi mô tả phân trang
    */
   getPaginationInfo(): string {
     if (this.total === 0) return 'Hiển thị 0 bình luận';
     const startIndex = (this.pageIndex - 1) * this.pageSize + 1;
     const endIndex = Math.min(startIndex + this.pageSize - 1, this.total);
     const displayStartIndex = Math.min(startIndex, this.total);
     return `Hiển thị <strong>${displayStartIndex}</strong> đến <strong>${endIndex}</strong> của <strong>${this.total}</strong> bình luận`;
   }

}