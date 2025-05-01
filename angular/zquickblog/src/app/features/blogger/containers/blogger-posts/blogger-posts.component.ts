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
import { AuthService } from '../../../../core/services/auth.service'; // **** Import AuthService ****

// Import các Models cần thiết (Sử dụng các interfaces từ file shared models bạn cung cấp)
import { Post } from '../../../../shared/models/post.model';
import { Language } from '../../../../shared/models/language.model';
import { Category } from '../../../../shared/models/category.model';
import { User } from '../../../../shared/models/user.model'; // Import User để dùng interface

import { finalize } from 'rxjs/operators'; // Import finalize để xử lý loading
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse để xử lý lỗi API

// **** Định nghĩa Interface để quản lý trạng thái frontend ****
// Mở rộng interface Post từ shared models
interface PostWithTranslations extends Post {
  expand: boolean; // Để quản lý trạng thái expand row
  translationsLoaded: boolean; // Cờ kiểm tra đã tải translations chưa
  loadingTranslations: boolean; // Cờ kiểm tra đang tải translations không
  // translations property đã có trong Post model, nhưng có thể cần đảm bảo kiểu dữ liệu đúng
  // translations?: Post[]; // Đã có trong Post model, không cần khai báo lại trừ khi ghi đè kiểu
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
      DatePipe // Cung cấp DatePipe
  ]
})
export class BloggerPostsComponent implements OnInit {
  searchText = '';
  filterLanguageId: number | string | null = null; // Filter language ID

  loading = false; // Loading cho bảng chính
  displayPosts: PostWithTranslations[] = []; // Danh sách bài viết gốc hiển thị

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

  languageOptions: Language[] = []; // Dữ liệu ngôn ngữ từ service

  pageIndex = 1;
  pageSize = 10;
  total = 0;

  // **** KHÔNG CẦN BIẾN RIÊNG currentUserId NỮA ****
  // private currentUserId: number | null = null;

  constructor(
    private message: NzMessageService,
    private modalService: NzModalService,
    private postService: PostService, // Inject PostService
    private languageService: LanguageService, // Inject LanguageService
    private authService: AuthService, // **** Inject AuthService ****
    private datePipe: DatePipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    // **** LẤY USER ID TỪ AUTH SERVICE ****
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.id) {
       // Xử lý trường hợp người dùng chưa đăng nhập hoặc không có ID
       this.message.error("You must be logged in to view your posts.");
       // Redirect về trang login hoặc hiển thị thông báo khác
       // this.router.navigate(['/login']);
       return; // Ngừng fetch nếu không có user ID
    }

    this.fetchLanguages(); // Tải danh sách ngôn ngữ
    this.fetchPosts(); // Tải danh sách bài viết gốc của user
  }

  // ============================================
  // **Hàm lấy danh sách ngôn ngữ**
  // ============================================
  /**
   * Lấy danh sách ngôn ngữ từ API để populate filter và dropdown
   */
  fetchLanguages(): void {
     this.languageService.getAll({ orderBy: 'name', order: 'ASC' }).subscribe({
         next: (res) => {
             this.languageOptions = res.data || [];
             // console.log("Fetched Languages:", this.languageOptions); // Log để kiểm tra
         },
         error: (err) => {
             console.error("Error fetching languages:", err);
             // Có thể hiển thị thông báo lỗi nếu cần thiết
         }
     });
  }

  // ============================================
  // **Hàm lấy danh sách bài viết gốc**
  // ============================================
  /**
   * Lấy danh sách bài viết gốc (original_post_id is null) của user hiện tại từ API
   */
  fetchPosts(): void {
    // **** Lấy user ID trực tiếp từ AuthService trước khi gọi API ****
    const currentUser = this.authService.getCurrentUser();
     if (!currentUser?.id) {
         // Nếu không có user ID (trường hợp logout sau khi component đã load), thoát hàm
         console.warn("User logged out, stopping fetchPosts.");
         this.displayPosts = []; // Xóa dữ liệu cũ
         this.total = 0;
         this.loading = false;
         this.message.warning("Your session has expired. Please log in again.");
         // this.router.navigate(['/login']); // Tùy chọn: redirect
         return;
     }


    this.loading = true; // Bật loading cho bảng chính
    this.postService.getAll({
      page: this.pageIndex,
      limit: this.pageSize,
      search: this.searchText || undefined, // Gửi searchText nếu có giá trị
      languageId: this.filterLanguageId || undefined, // Gửi filterLanguageId nếu có
      userId: currentUser.id, // **** SỬ DỤNG USER ID TỪ AUTH SERVICE ****
      originalPost: 'true', // **** CHỈ LẤY BÀI VIẾT GỐC ****
      includeRelations: true, // Bao gồm User, Language, Categories
      orderBy: 'createdAt', // Sắp xếp theo thời gian tạo mặc định
      order: 'DESC'
    }).pipe(
      finalize(() => this.loading = false) // Tắt loading khi request hoàn thành
    )
    .subscribe({
      next: (res) => {
        // Map dữ liệu nhận được để thêm các thuộc tính quản lý trạng thái frontend
        this.displayPosts = (res.data || []).map(post => ({
          ...post,
          expand: false, // Mặc định đóng
          // translations: undefined, // Đã có trong Post model, nhưng ban đầu có thể là [] hoặc null từ backend
          translationsLoaded: false, // Ban đầu chưa tải translations
          loadingTranslations: false // Ban đầu không loading translations
        }));
        this.total = res.pagination?.total || 0;
        //console.log("Fetched Posts:", this.displayPosts); // Log dữ liệu để debug
      },
      error: (err: HttpErrorResponse) => { // Bắt lỗi cụ thể
        console.error("Error fetching posts:", err);
         // Kiểm tra status code 401 (Unauthorized) để xử lý session hết hạn
         if (err.status === 401) {
             this.message.error("Your session has expired. Please log in again.");
             // this.authService.logout(); // Tự động logout nếu 401 (Tùy logic app)
             // this.router.navigate(['/login']); // Tùy chọn: redirect
         } else {
             const errorMessage = err.error?.message || 'Failed to load posts. Please try again.';
             this.message.error(errorMessage);
         }
        this.displayPosts = []; // Reset dữ liệu nếu lỗi
        this.total = 0;
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
    this.fetchPosts(); // Gọi lại fetchPosts với trang mới
  }

  /**
   * Xử lý khi thay đổi số lượng item/trang
   * @param size Số lượng mới
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1; // Reset về trang 1
    this.fetchPosts(); // Gọi lại fetchPosts với size mới
  }

  // ============================================
  // **Tìm kiếm và lọc**
  // ============================================
  /**
   * Xử lý tìm kiếm khi người dùng nhập hoặc nhấn Enter
   */
  onSearch(): void {
    this.pageIndex = 1; // Reset về trang 1 khi tìm kiếm
    this.fetchPosts(); // Gọi lại fetchPosts với search text mới
  }

  /**
   * Xử lý khi thay đổi filter ngôn ngữ
   */
  onLanguageFilterChange(): void {
      this.pageIndex = 1; // Reset về trang 1 khi lọc
      this.fetchPosts(); // Gọi lại fetchPosts với language filter mới
  }

  // ============================================
  // **Xử lý Expand Row (Translations)**
  // ============================================
  /**
   * Toggle trạng thái expand của row và tải translations nếu chưa có
   * @param post Bài viết gốc (có thêm trạng thái frontend)
   */
  toggleExpand(post: PostWithTranslations): void {
      post.expand = !post.expand; // Toggle trạng thái expand

      // Nếu mở rộng VÀ translations chưa được tải VÀ hiện tại không đang tải
      if (post.expand && !post.translationsLoaded && !post.loadingTranslations) {
          post.loadingTranslations = true; // Bắt đầu loading cho row này
          this.postService.getPostsFromOriginal(post.id, { includeRelations: true }) // Gọi API lấy translations cho bài gốc này
             .pipe(
                 finalize(() => {
                     post.loadingTranslations = false; // Tắt loading khi request hoàn thành
                 })
             )
              .subscribe({
                  next: (res) => {
                      // Gán dữ liệu translations. Đảm bảo post.translations là mảng.
                      post.translations = res.data || [];
                      post.translationsLoaded = true; // Đánh dấu đã tải xong
                       // console.log(`Loaded translations for post ${post.id}:`, post.translations); // Debug
                  },
                  error: (err: HttpErrorResponse) => { // Bắt lỗi cụ thể
                      console.error(`Error loading translations for post ${post.id}:`, err);
                       const errorMessage = err.error?.message || `Failed to load translations for "${post.title}".`;
                      this.message.error(errorMessage);
                      post.translations = []; // Gán mảng rỗng nếu lỗi
                      post.translationsLoaded = true; // Vẫn đánh dấu đã tải (dù lỗi) để không cố tải lại
                       // Xử lý lỗi 401 nếu cần
                       if (err.status === 401) {
                          // this.authService.logout(); // Tùy chọn: logout
                          // this.router.navigate(['/login']); // Tùy chọn: redirect
                       }
                  }
              });
      }
  }


  // ============================================
  // **Hành động với Bài viết Gốc**
  // ============================================
  /**
   * Xóa bài viết gốc (bao gồm các bản dịch liên quan ở backend)
   * @param id ID bài viết gốc cần xóa
   */
  deletePost(id: number): void {
    // Modal xác nhận đã được xử lý trong template HTML với nz-popconfirm
    // Logic trong (nzOnConfirm) sẽ gọi hàm này

    this.loading = true; // Bật loading cho cả bảng trong khi xóa
    this.postService.delete(id) // Gọi service xóa bài viết
      .pipe(finalize(() => this.loading = false)) // Tắt loading khi hoàn thành
      .subscribe({
        next: () => {
          this.message.success('Post and its translations deleted successfully');
          // Sau khi xóa thành công, tải lại danh sách bài viết gốc để cập nhật bảng
          this.fetchPosts();
        },
        error: (err: HttpErrorResponse) => { // Bắt lỗi cụ thể
          console.error("Error deleting post:", err);
           const errorMessage = err.error?.message || 'Failed to delete post. Please try again.';
           this.message.error(errorMessage);
           // Xử lý lỗi 401, 403, 404 nếu cần
           if (err.status === 401 || err.status === 403) {
               // Not authorized
           } else if (err.status === 404) {
               // Not found
           }
        }
      });
  }

  /**
   * Publish bài viết gốc
   * @param id ID bài viết gốc cần publish
   */
  publishPost(id: number): void {
     this.loading = true; // Bật loading
     this.postService.update(id, { status: 'published' }) // Gọi service update status
        .pipe(finalize(() => this.loading = false))
        .subscribe({
            next: (updatedPost) => {
                this.message.success('Post published successfully');
                // Cập nhật trạng thái bài viết gốc trong displayPosts local để hiển thị ngay sự thay đổi
                const postIndex = this.displayPosts.findIndex(p => p.id === updatedPost.id);
                if (postIndex > -1) {
                    // Cập nhật object trong mảng với dữ liệu mới nhận được
                    // Sử dụng Object.assign hoặc spread operator để giữ nguyên các thuộc tính frontend (expand, ...)
                    Object.assign(this.displayPosts[postIndex], updatedPost);
                    // this.displayPosts[postIndex] = { ...this.displayPosts[postIndex], ...updatedPost }; // Cách khác
                }
                // Không cần fetchPosts() lại toàn bộ danh sách nếu chỉ cập nhật trạng thái local thành công
            },
            error: (err: HttpErrorResponse) => { // Bắt lỗi cụ thể
                console.error("Error publishing post:", err);
                const errorMessage = err.error?.message || 'Failed to publish post. Please try again.';
                this.message.error(errorMessage);
                 // Xử lý lỗi 401, 403, 404 nếu cần
            }
        });
  }

   /**
    * Điều hướng đến trang tạo bài viết mới để thêm bản dịch cho bài viết gốc
    * @param originalPostId ID bài viết gốc
    */
   addLanguageVariant(originalPostId: number): void {
      // Điều hướng đến route tạo bài viết mới và truyền originalPostId qua query params
      // Trang tạo bài viết sẽ nhận query param này để đặt giá trị cho original_post_id
      this.router.navigate(['/blogger/posts/create'], {
          queryParams: {
              originalPostId: originalPostId
              // Có thể truyền thêm thông tin khác nếu cần, ví dụ: originalPostTitle
              // originalPostTitle: this.displayPosts.find(p => p.id === originalPostId)?.title
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
      // Modal xác nhận đã được xử lý trong template HTML với nz-popconfirm

      // Tìm bài viết gốc trong displayPosts
      const originalPost = this.displayPosts.find(p => p.id === originalPostId);

      // **** THÊM KIỂM TRA Ở ĐÂY ****
      if (!originalPost) {
          console.error(`Original post ${originalPostId} not found in displayPosts for translation ${translationId}`);
          this.message.error("Original post not found. Cannot delete translation."); // Thông báo lỗi cho người dùng
          return; // Dừng thực thi nếu không tìm thấy bài viết gốc
      }
      // **** KẾT THÚC KIỂM TRA ****


      originalPost.loadingTranslations = true; // Bật loading spinner cho nhóm translations

      this.postService.delete(translationId) // Gọi service xóa bản dịch
         .pipe(finalize(() => {
             // **** KẾT THÚC LOADING NẰM TRONG FINALIZE ****
             // Sau khi hoàn thành request (thành công hoặc lỗi), tắt loading
             originalPost.loadingTranslations = false;
         }))
          .subscribe({
              next: () => {
                  this.message.success('Translation deleted successfully');
                  // Cập nhật danh sách translations cho bài viết gốc đó local
                  if (originalPost.translations) { // Vẫn cần kiểm tra originalPost.translations vì nó có thể là undefined/null ban đầu
                      originalPost.translations = originalPost.translations.filter(t => t.id !== translationId);
                      // Nếu danh sách translations trở nên trống sau khi xóa
                      if (originalPost.translations.length === 0) {
                          originalPost.translationsLoaded = false; // Đặt lại trạng thái tải
                          originalPost.expand = false; // Tự động đóng row expand nếu không còn bản dịch nào
                      }
                  }
              },
              error: (err: HttpErrorResponse) => { // Bắt lỗi cụ thể
                  console.error("Error deleting translation:", err);
                  const errorMessage = err.error?.message || 'Failed to delete translation. Please try again.';
                  this.message.error(errorMessage);
                  // Xử lý lỗi 401, 403, 404 nếu cần
              }
          });
  }

  /**
   * Publish bản dịch
   * @param originalPostId ID bài viết gốc (không dùng trong service call, chỉ để tìm bài gốc local)
   * @param translationId ID bản dịch cần publish
   */
  publishLanguageVariant(originalPostId: number, translationId: number): void {
       // Tìm bài viết gốc và bản dịch local để cập nhật trạng thái hiển thị
       const originalPost = this.displayPosts.find(p => p.id === originalPostId);
       const variantToUpdate = originalPost?.translations?.find(v => v.id === translationId); // Sử dụng Optional Chaining

       // **** THÊM KIỂM TRA Ở ĐÂY ****
       // Kiểm tra xem cả bài viết gốc và bản dịch có tồn tại không
       if (!originalPost || !variantToUpdate) {
            console.error(`Original post ${originalPostId} or translation ${translationId} not found in displayPosts`);
            this.message.error('Translation not found.'); // Thông báo lỗi cho người dùng
            return; // Dừng thực thi nếu không tìm thấy
       }
       // **** KẾT THÚC KIỂM TRA ****


       originalPost.loadingTranslations = true; // Bật loading spinner cho nhóm translations

       this.postService.update(translationId, { status: 'published' }) // Gọi service update status cho bản dịch
          .pipe(finalize(() => {
               // **** KẾT THÚC LOADING NẰM TRONG FINALIZE ****
               // Sau khi hoàn thành request (thành công hoặc lỗi), tắt loading
               originalPost.loadingTranslations = false;
          }))
           .subscribe({
               next: (updatedVariant) => {
                   this.message.success('Translation published successfully');
                   // Cập nhật trạng thái bản dịch trong mảng translations local
                   // variantToUpdate giờ chắc chắn tồn tại do kiểm tra ở đầu hàm
                   // originalPost cũng chắc chắn tồn tại
                   if (originalPost.translations) { // Vẫn cần kiểm tra translations mảng
                       const variantIndex = originalPost.translations.findIndex(v => v.id === updatedVariant.id);
                       if (variantIndex > -1) {
                           // Cập nhật object trong mảng translations với dữ liệu mới nhận được
                           Object.assign(originalPost.translations[variantIndex], updatedVariant);
                           // originalPost.translations[variantIndex] = { ...originalPost.translations[variantIndex], ...updatedVariant }; // Cách khác
                       }
                   }
               },
               error: (err: HttpErrorResponse) => { // Bắt lỗi cụ thể
                   console.error("Error publishing translation:", err);
                   const errorMessage = err.error?.message || 'Failed to publish translation. Please try lại.';
                   this.message.error(errorMessage);
                    // Xử lý lỗi 401, 403, 404 nếu cần
               }
           });
   }


  // ============================================
  // **Hàm hỗ trợ hiển thị (Giữ nguyên hoặc cập nhật nhẹ)**
  // ============================================

  /**
   * Lấy màu cho status
   * @param status Trạng thái bài viết
   * @returns Màu sắc
   */
  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'pending': return 'processing';
      default: return 'default';
    }
  }

   /**
    * Lấy màu cho category (sử dụng lại từ AdminPostComponent)
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
       case 'Trí tuệ nhân tạo': return 'cyan';
       // Thêm các category khác nếu cần
       default: return 'default';
     }
   }

   /**
    * Lấy avatar tác giả (sử dụng lại từ AdminPostComponent)
    * @param avatarUrl Đường dẫn avatar
    * @returns Đường dẫn avatar hoặc placeholder
    */
   getAuthorAvatar(avatarUrl: string | null | undefined): string {
       return avatarUrl || 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'; // Placeholder
   }

  /**
   * Lấy thông tin phân trang dạng text (sử dụng lại từ AdminPostComponent)
   * @returns Chuỗi mô tả phân trang
   */
  getPaginationInfo(): string {
    if (this.total === 0) return 'Showing 0 posts';
    const startIndex = (this.pageIndex - 1) * this.pageSize + 1;
    const endIndex = Math.min(startIndex + this.pageSize - 1, this.total);
     const displayStartIndex = Math.min(startIndex, this.total); // Trường hợp total = 0
    return `Showing <strong>${displayStartIndex}</strong> to <strong>${endIndex}</strong> of <strong>${this.total}</strong> posts`;
  }

}