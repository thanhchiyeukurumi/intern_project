import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

// **** Cập nhật đường dẫn Import cho các Service và Models ****
import { PostService } from '../../../../core/services/post.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthService } from '../../../../core/services/auth.service';

// Import các Models cần thiết (Sử dụng các interfaces từ file shared models bạn cung cấp)
import { Post } from '../../../../shared/models/post.model';
import { Language } from '../../../../shared/models/language.model';
import { Category } from '../../../../shared/models/category.model';
import { User } from '../../../../shared/models/user.model';

import { finalize } from 'rxjs/operators'; // Vẫn giữ finalize để tắt loading
import { HttpErrorResponse } from '@angular/common/http';

// **** Định nghĩa Interface để quản lý trạng thái frontend ****
// Chỉ cần thuộc tính `expand`
interface PostWithTranslations extends Post {
  expand: boolean; // Để quản lý trạng thái expand row
  // translations?: Post[]; // Property này đã có trong Post model
  // translationsLoaded không cần
  // loadingTranslations không cần
}


@Component({
  selector: 'app-blogger-posts',
  templateUrl: './blogger-posts.component.html',
  styleUrls: ['./blogger-posts.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzTableModule,
    NzDropDownModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzPopconfirmModule,
    NzTagModule,
    NzTypographyModule,
    NzBadgeModule,
    NzSelectModule,
    NzEmptyModule,
    NzCardModule,
    NzDividerModule,
    NzModalModule,
    DatePipe,
    NzPaginationModule
  ],
  providers: [
      DatePipe
  ]
})
export class BloggerPostsComponent implements OnInit {
  searchText = '';
  filterLanguageId: number | string | null = null;

  loading = false; // Loading cho bảng chính
  displayPosts: PostWithTranslations[] = [];

  // Định nghĩa cột (chỉ để tính colspan)
  listOfColumns = [
    { title: 'Title' },
    { title: 'Status' },
    { title: 'Published' },
    { title: 'Language' },
    { title: 'Category' },
    { title: 'Views' },
    { title: 'Actions' }
  ];

  languageOptions: Language[] = [];

  pageIndex = 1;
  pageSize = 10;
  total = 0;

  constructor(
    private message: NzMessageService,
    private modalService: NzModalService,
    private postService: PostService,
    private languageService: LanguageService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.id) {
       this.message.error("You must be logged in to view your posts.");
       return;
    }

    this.fetchLanguages();
    this.fetchPosts();
  }

  fetchLanguages(): void {
     this.languageService.getAll({ orderBy: 'name', order: 'ASC' }).subscribe({
         next: (res) => {
             this.languageOptions = res.data || [];
         },
         error: (err) => {
             console.error("Error fetching languages:", err);
         }
     });
  }

  /**
   * Lấy danh sách bài viết gốc (original_post_id is null) của user hiện tại từ API.
   * Backend không cần bao gồm bản dịch trong phản hồi ban đầu.
   */
  fetchPosts(): void {
    const currentUser = this.authService.getCurrentUser();
     if (!currentUser?.id) {
         console.warn("User logged out, stopping fetchPosts.");
         this.displayPosts = [];
         this.total = 0;
         this.loading = false;
         this.message.warning("Your session has expired. Please log in again.");
         return;
     }

    this.loading = true;
    this.postService.getAll({
      page: this.pageIndex,
      limit: this.pageSize,
      search: this.searchText || undefined,
      languageId: this.filterLanguageId || undefined,
      userId: currentUser.id,
      originalPost: 'true', // Chỉ lấy bài viết gốc
      includeRelations: true, // Bao gồm User, Language, Categories (KHÔNG cần translations ở đây)
      orderBy: 'createdAt',
      order: 'DESC'
    }).pipe(
      finalize(() => this.loading = false)
    )
    .subscribe({
      next: (res) => {
        // Map dữ liệu nhận được, chỉ thêm thuộc tính `expand` và đảm bảo `translations` là undefined ban đầu
        this.displayPosts = (res.data || []).map(post => ({
          ...post,
          expand: false, // Mặc định đóng
          translations: undefined // Đảm bảo translations là undefined ban đầu
        }));
        this.total = res.pagination?.total || 0;
        // console.log("Fetched Posts:", this.displayPosts); // Log dữ liệu để debug
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error fetching posts:", err);
         if (err.status === 401) {
             this.message.error("Your session has expired. Please log in again.");
         } else {
             const errorMessage = err.error?.message || 'Failed to load posts. Please try again.';
             this.message.error(errorMessage);
         }
        this.displayPosts = [];
        this.total = 0;
      }
    });
  }

  // ============================================
  // **Xử lý phân trang**
  // ============================================
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.fetchPosts();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.fetchPosts();
  }

  // ============================================
  // **Tìm kiếm và lọc**
  // ============================================
  onSearch(): void {
    this.pageIndex = 1;
    this.fetchPosts();
  }

  onLanguageFilterChange(): void {
      this.pageIndex = 1;
      this.fetchPosts();
  }

  // ============================================
  // **Xử lý Expand Row (Translations) - Đơn giản hóa**
  // ============================================
  /**
   * Toggle trạng thái expand của row và tải translations chỉ khi expand VÀ chưa được tải
   * @param post Bài viết gốc (có thêm trạng thái frontend)
   */
  toggleExpand(post: PostWithTranslations): void {
      post.expand = !post.expand; // Toggle trạng thái expand

      // Nếu mở rộng VÀ translations chưa được tải (translations là undefined hoặc null)
      // Dựa vào trạng thái của post.translations để quyết định có tải lại không
      if (post.expand && post.translations === undefined) {
          // Bật loading chung cho bảng hoặc loading riêng cho row nếu cần (cần thêm cờ loading riêng)
          // this.loading = true; // Bật loading chung
          this.postService.getPostsFromOriginal(post.id, { includeRelations: true }) // Gọi API lấy translations
             .pipe(
                 finalize(() => {
                     // this.loading = false; // Tắt loading chung
                     // Nếu dùng loading riêng cho row: post.loadingTranslations = false;
                 })
             )
              .subscribe({
                  next: (res) => {
                      // Gán dữ liệu translations. res.data sẽ là [] nếu không có bản dịch
                      post.translations = res.data || [];
                       console.log(`Loaded translations for post ${post.id}:`, post.translations); // Debug
                  },
                  error: (err: HttpErrorResponse) => {
                      console.error(`Error loading translations for post ${post.id}:`, err);
                       const errorMessage = err.error?.message || `Failed to load translations for "${post.title}".`;
                      this.message.error(errorMessage);
                      post.translations = []; // Gán mảng rỗng nếu lỗi
                  }
              });
      }
       // Khi đóng expand, có thể xóa dữ liệu translations để tiết kiệm bộ nhớ nếu muốn
       // if (!post.expand && post.translations !== undefined) {
       //     post.translations = undefined;
       // }
  }


  // ============================================
  // **Hành động với Bài viết Gốc**
  // ============================================

  deletePost(id: number): void {
    this.loading = true;
    this.postService.delete(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.message.success('Post and its translations deleted successfully');
          this.fetchPosts();
        },
        error: (err: HttpErrorResponse) => {
          console.error("Error deleting post:", err);
           const errorMessage = err.error?.message || 'Failed to delete post. Please try again.';
           this.message.error(errorMessage);
        }
      });
  }

  publishPost(id: number): void {
     this.loading = true;
     this.postService.update(id, { status: 'published' })
        .pipe(finalize(() => this.loading = false))
        .subscribe({
            next: (updatedPost) => {
                this.message.success('Post published successfully');
                const postIndex = this.displayPosts.findIndex(p => p.id === updatedPost.id);
                if (postIndex > -1) {
                    Object.assign(this.displayPosts[postIndex], updatedPost);
                }
            },
            error: (err: HttpErrorResponse) => {
                console.error("Error publishing post:", err);
                const errorMessage = err.error?.message || 'Failed to publish post. Please try again.';
                this.message.error(errorMessage);
            }
        });
  }

   addLanguageVariant(originalPostId: number): void {
      this.router.navigate(['/blogger/posts/create'], {
          queryParams: {
              originalPostId: originalPostId
          }
      });
   }


  // ============================================
  // **Hành động với Bản dịch (Translations)**
  // ============================================
  /**
   * Xóa bản dịch
   * @param originalPostId ID bài viết gốc (để tìm bài gốc local và cập nhật translations)
   * @param translationId ID bản dịch cần xóa
   */
  deleteLanguageVariant(originalPostId: number, translationId: number): void {
      const originalPost = this.displayPosts.find(p => p.id === originalPostId);

      if (!originalPost) {
          console.error(`Original post ${originalPostId} not found in displayPosts for translation ${translationId}`);
          this.message.error("Original post not found. Cannot delete translation.");
          return;
      }

       this.loading = true; // Bật loading chung cho bảng
       // Nếu muốn loading riêng cho nhóm translations: originalPost.loadingTranslations = true; (cần thêm lại cờ này)

      this.postService.delete(translationId)
         .pipe(finalize(() => {
             this.loading = false; // Tắt loading chung
             // Nếu dùng loading riêng: originalPost.loadingTranslations = false;
         }))
          .subscribe({
              next: () => {
                  this.message.success('Translation deleted successfully');
                  // Cập nhật danh sách translations cho bài viết gốc đó local
                  if (originalPost.translations) {
                      originalPost.translations = originalPost.translations.filter(t => t.id !== translationId);
                      // Nếu danh sách translations trở nên trống sau khi xóa, đóng expand
                      if (originalPost.translations.length === 0) {
                         originalPost.expand = false;
                         // Có thể set originalPost.translations = undefined; nếu muốn reset hoàn toàn
                      }
                  }
              },
              error: (err: HttpErrorResponse) => {
                  console.error("Error deleting translation:", err);
                  const errorMessage = err.error?.message || 'Failed to delete translation. Please try again.';
                  this.message.error(errorMessage);
              }
          });
  }

  /**
   * Publish bản dịch
   * @param originalPostId ID bài viết gốc (không dùng trong service call, chỉ để tìm bài gốc local)
   * @param translationId ID bản dịch cần publish
   */
  publishLanguageVariant(originalPostId: number, translationId: number): void {
       const originalPost = this.displayPosts.find(p => p.id === originalPostId);
       const variantToUpdate = originalPost?.translations?.find(v => v.id === translationId);

       if (!originalPost || !variantToUpdate) {
            console.error(`Original post ${originalPostId} or translation ${translationId} not found in displayPosts`);
            this.message.error('Translation not found.');
            return;
       }

       this.loading = true; // Bật loading chung cho bảng
       // Nếu muốn loading riêng cho nhóm translations: originalPost.loadingTranslations = true; (cần thêm lại cờ này)

       this.postService.update(translationId, { status: 'published' })
          .pipe(finalize(() => {
               this.loading = false; // Tắt loading chung
               // Nếu dùng loading riêng: originalPost.loadingTranslations = false;
          }))
           .subscribe({
               next: (updatedVariant) => {
                   this.message.success('Translation published successfully');
                   // Cập nhật trạng thái bản dịch trong mảng translations local
                   if (originalPost.translations) {
                       const variantIndex = originalPost.translations.findIndex(v => v.id === updatedVariant.id);
                       if (variantIndex > -1) {
                           Object.assign(originalPost.translations[variantIndex], updatedVariant);
                       }
                   }
               },
               error: (err: HttpErrorResponse) => {
                   console.error("Error publishing translation:", err);
                   const errorMessage = err.error?.message || 'Failed to publish translation. Please try lại.';
                   this.message.error(errorMessage);
               }
           });
   }


  // ============================================
  // **Hàm hỗ trợ hiển thị**
  // ============================================

  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'pending': return 'processing';
      default: return 'default';
    }
  }

   getCategoryColor(categoryName: string | undefined): string {
     switch (categoryName) {
       case 'Công nghệ': return 'blue';
       case 'Technology': return 'blue';
       case 'Development': return 'green';
       case 'Phần mềm': return 'geekblue';
       case 'Design': return 'purple';
       case 'Trí tuệ nhân tạo': return 'cyan';
       default: return 'default';
     }
   }

   getAuthorAvatar(avatarUrl: string | null | undefined): string {
       return avatarUrl || 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png';
   }

  getPaginationInfo(): string {
    if (this.total === 0) return 'Showing 0 posts';
    const startIndex = (this.pageIndex - 1) * this.pageSize + 1;
    const endIndex = Math.min(startIndex + this.pageSize - 1, this.total);
    const displayStartIndex = Math.min(startIndex, this.total);
    return `Showing <strong>${displayStartIndex}</strong> to <strong>${endIndex}</strong> of <strong>${this.total}</strong> posts`;
  }

}