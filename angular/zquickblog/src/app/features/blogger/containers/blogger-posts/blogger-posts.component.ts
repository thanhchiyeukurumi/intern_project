// src/app/pages/blogger/posts/blogger-posts.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
import { Subscription, switchMap, of, Subject } from 'rxjs'; // Bỏ combineLatest nếu không dùng nữa
import { debounceTime, distinctUntilChanged, tap, finalize } from 'rxjs/operators';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

// --- Service Imports ---
import { PostService } from '../../../../core/services/post.service'; // ĐIỀU CHỈNH ĐƯỜNG DẪN
import { LanguageService } from '../../../../core/services/language.service'; // ĐIỀU CHỈNH ĐƯỜNG DẪN
import { AuthService } from '../../../../core/services/auth.service'; // ĐIỀU CHỈNH ĐƯỜNG DẪN

// --- Model Imports ---
// Sử dụng interface PostForDisplay đã tạo ở trên, và Post, PostDto từ file model của bạn
import { Post, PostDto, PostForDisplay } from '../../../../shared/models/post.model'; // ĐIỀU CHỈNH ĐƯỜNG DẪN
import { Language } from '../../../../shared/models/language.model'; // ĐIỀU CHỈNH ĐƯỜNG DẪN
import { User } from '../../../../shared/models/user.model'; // ĐIỀU CHỈNH ĐƯỜNG DẪN

import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-blogger-posts',
  templateUrl: './blogger-posts.component.html',
  styleUrls: ['./blogger-posts.component.css'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, NzTableModule, NzDropDownModule,
    NzButtonModule, NzIconModule, NzInputModule, NzPopconfirmModule, NzTagModule,
    NzTypographyModule, NzBadgeModule, NzSelectModule, NzEmptyModule, NzCardModule,
    NzDividerModule, NzModalModule, DatePipe, NzPaginationModule, NzToolTipModule
  ],
  providers: [ DatePipe ]
})
export class BloggerPostsComponent implements OnInit, OnDestroy {
  loading = false;
  displayPosts: PostForDisplay[] = []; // Sử dụng PostForDisplay

  pageIndex = 1;
  pageSize = 10;
  total = 0;

  searchText = '';
  filterLanguageId: number | string | null = null;
  private searchTextChanged = new Subject<string>();
  private languageFilterChanged = new Subject<number | string | null>();

  languageOptions: Language[] = [];
  currentUser: User | null = null;
  private subscriptions: Subscription[] = [];
  private fetchTrigger = new Subject<void>(); // Subject để trigger fetch

  // Định nghĩa cột (chỉ để tính colspan trong template)
  listOfColumns = [
     { title: 'Expand' },
     { title: 'Title' },
    { title: 'Status' },
    { title: 'Published' },
     { title: 'Language' },
    { title: 'Category' },
    { title: 'Views' },
    { title: 'Actions' }
  ];

  private message = inject(NzMessageService);
  private modalService = inject(NzModalService);
  private postService = inject(PostService);
  private languageService = inject(LanguageService);
  private authService = inject(AuthService);
  private router = inject(Router);


  ngOnInit(): void {
    const userSub = this.authService.currentUser$.pipe(
        tap(user => {
             this.currentUser = user;
             if (!user || !user.id) {
                 this.displayPosts = [];
                 this.total = 0;
                 this.loading = false;
             } else {
                 if (this.languageOptions.length === 0) {
                     this.fetchLanguages();
                 }
                 this.startDataFetchingStream();
                 this.fetchPosts(); // Fetch lần đầu
             }
        })
    ).subscribe();
    this.subscriptions.push(userSub);

    const searchSub = this.searchTextChanged.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.onSearchOrFilterChange() );
    this.subscriptions.push(searchSub);

     const languageFilterSub = this.languageFilterChanged.pipe(
       distinctUntilChanged()
     ).subscribe(() => this.onSearchOrFilterChange() );
     this.subscriptions.push(languageFilterSub);
  }

  ngOnDestroy(): void {
      this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  startDataFetchingStream(): void {
      if (!this.currentUser?.id) return;

      const dataFetchSub = this.fetchTrigger.pipe(
          tap(() => this.loading = true),
          switchMap(() => {
               if (!this.currentUser?.id) {
                   return of({ data: [], pagination: { total: 0 } });
               }
               return this.postService.getByUser(this.currentUser.id, {
                page: this.pageIndex,
                limit: this.pageSize,
                search: this.searchText ? this.searchText.trim() : undefined,
                languageId: this.filterLanguageId || undefined,
                originalPost: 'true',
                includeRelations: true,
                orderBy: 'createdAt',
                order: 'DESC'
              }).pipe(
                  finalize(() => this.loading = false),
                  tap({ error: (err: HttpErrorResponse) => this.handleFetchError(err, "posts") })
              );
          })
      ).subscribe({
          next: (res) => {
              this.displayPosts = (res.data || []).map(post => ({
                  ...post, // expand và translations đã có trong Post model gốc
                  loadingTranslations: false // Chỉ thêm cờ này
              }));
              this.total = res.pagination?.total || 0;
              
              // Pre-load các bản dịch cho từng bài viết để hiển thị số lượng
              this.preloadAllTranslations();
          }
      });
      this.subscriptions.push(dataFetchSub);
  }
  
  // Phương thức để tải trước tất cả các bản dịch
  preloadAllTranslations(): void {
      // Lặp qua từng bài viết và gọi API để lấy các bản dịch
      this.displayPosts.forEach(post => {
          if (!post.translations) {
              this.postService.getPostsFromOriginal(post.id, { includeRelations: true })
                  .subscribe({
                      next: (res) => {
                          post.translations = res.data || [];
                      },
                      error: () => {
                          post.translations = [];
                      }
                  });
          }
      });
  }

  fetchPosts(): void {
     this.fetchTrigger.next();
  }

  fetchLanguages(): void {
     this.languageService.getAll({ orderBy: 'name', order: 'ASC' }).subscribe({
         next: (res) => this.languageOptions = res.data || [],
         error: (err) => this.handleFetchError(err, "languages")
     });
  }

  handleFetchError(err: HttpErrorResponse, context: string): void {
    console.error(`Error fetching ${context}:`, err);
    const errorMessage = err.error?.message || `Failed to load ${context}. Please try again.`;
    this.message.error(errorMessage);
    if (context === "posts") {
        this.displayPosts = [];
        this.total = 0;
    } else if (context === "languages") {
        this.languageOptions = [];
    }
    if (err.status === 401 && this.currentUser) { // Chỉ redirect nếu user đã từng đăng nhập
        this.message.error("Your session has expired. Please log in again.");
        this.authService.logout(); // Gọi hàm logout của auth service
        this.router.navigate(['/login']);
    }
}

  onPageIndexChange(index: number): void {
    if (index === this.pageIndex) return;
      this.pageIndex = index;
    this.fetchPosts();
  }

  onPageSizeChange(size: number): void {
    if (size === this.pageSize) return;
      this.pageSize = size;
    this.pageIndex = 1;
    this.fetchPosts();
  }

  onSearchInputChange(value: string): void {
      this.searchText = value;
      this.searchTextChanged.next(value.trim());
  }

  onLanguageFilterChange(value: number | string | null): void {
      // filterLanguageId đã được two-way bind [(ngModel)]
      this.languageFilterChanged.next(value);
  }

  onSearchOrFilterChange(): void {
      this.pageIndex = 1;
      this.fetchPosts();
  }

  toggleExpand(post: PostForDisplay): void {
      // Model Post của bạn đã có 'expand', chỉ cần toggle nó
      post.expand = !post.expand;

      // Kiểm tra post.translations đã được định nghĩa chưa (tức là đã từng load hay chưa)
      // Nếu chưa (undefined) và đang mở expand và chưa loading -> thì mới load
      if (post.expand && !post.translations && !post.loadingTranslations) {
          post.loadingTranslations = true;
          // Service PostService.getPostsFromOriginal() của bạn
          const sub = this.postService.getPostsFromOriginal(post.id, { includeRelations: true })
             .pipe(finalize(() => post.loadingTranslations = false ))
              .subscribe({
                  next: (res) => {
                      post.translations = res.data || []; // Gán kết quả vào translations của post
                  },
                  error: (err: HttpErrorResponse) => {
                      this.handleFetchError(err, `translations for post ${post.id}`);
                      post.translations = [];
                  }
              });
          // Không cần push sub này vào this.subscriptions nếu nó là one-time load cho row
      }
  }

  confirmDeleteOriginalPost(post: PostForDisplay): void {
       this.modalService.confirm({
            nzTitle: `Xác nhận xóa: "${post.title}"`,
            nzContent: `<p>Xóa bài viết gốc này sẽ xóa cả nó và <b>tất cả các bản dịch</b>. Bạn chắc chắn?</p>`,
            nzOkText: 'Xóa Tất Cả',
            nzOkDanger: true,
            nzOnOk: () => this.deletePost(post.id),
       });
  }

  deletePost(postId: number): Promise<void> {
    this.loading = true;
    return new Promise<void>((resolve, reject) => {
        // Service PostService.delete() của bạn
        this.postService.delete(postId)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: () => {
              this.message.success('Bài viết và các bản dịch đã được xóa.');
              this.fetchPosts(); // Load lại danh sách bài gốc
              resolve();
            },
            error: (err: HttpErrorResponse) => {
              this.handleFetchError(err, `deleting post ${postId}`);
              reject(err);
            }
          });
    });
  }

  publishPost(post: PostForDisplay): void {
     if (post.status === 'published') return;
     this.loading = true;
     // Tạo DTO dựa trên PostDto interface của bạn
     // Chỉ gửi 'status' để update. Backend của bạn sẽ xử lý Partial<PostDto>
     const updateDto: Partial<PostDto> = { status: 'published' };

     // Service PostService.update() của bạn
     this.postService.update(post.id, updateDto)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
            next: (updatedPostFromApi) => {
                this.message.success('Bài viết đã được xuất bản.');
                const postIndex = this.displayPosts.findIndex(p => p.id === updatedPostFromApi.id);
                if (postIndex > -1) {
                    const currentDisplayPost = this.displayPosts[postIndex];
                    // Gán lại các thuộc tính từ API, giữ nguyên trạng thái frontend
                    this.displayPosts[postIndex] = {
                        ...updatedPostFromApi, // Dữ liệu mới từ API
                        expand: currentDisplayPost.expand, // Giữ expand
                        loadingTranslations: currentDisplayPost.loadingTranslations, // Giữ loadingTranslations
                        translations: currentDisplayPost.translations // Giữ translations nếu đã load
                    };
                }
            },
            error: (err: HttpErrorResponse) => this.handleFetchError(err, `publishing post ${post.id}`)
        });
  }

   addLanguageVariant(originalPostId: number): void {
      this.router.navigate(['/blogger/posts/create'], { queryParams: { originalPostId } });
   }

   confirmDeleteLanguageVariant(originalPost: PostForDisplay, translation: Post): void {
        this.modalService.confirm({
             nzTitle: `Xác nhận xóa bản dịch: "${translation.title}"`,
             nzContent: `<p>Bạn có chắc chắn muốn xóa bản dịch này không?</p>`,
             nzOkText: 'Xóa Bản Dịch',
             nzOkDanger: true,
             nzOnOk: () => this.deleteLanguageVariant(originalPost, translation.id),
        });
   }

  deleteLanguageVariant(originalPost: PostForDisplay, translationId: number): Promise<void> {
       if (!originalPost) {
           this.message.error("Original post not found.");
           return Promise.reject("Original post not found");
       }
       originalPost.loadingTranslations = true;

       return new Promise<void>((resolve, reject) => {
           // Service PostService.delete() của bạn
           this.postService.delete(translationId)
              .pipe(finalize(() => originalPost.loadingTranslations = false ))
               .subscribe({
                   next: () => {
                       this.message.success('Bản dịch đã được xóa.');
                       if (originalPost.translations) {
                           originalPost.translations = originalPost.translations.filter(t => t.id !== translationId);
                           if (originalPost.translations.length === 0) {
                              originalPost.expand = false; // Đóng expand nếu không còn bản dịch
                              // Có thể set originalPost.translations = undefined để trigger load lại nếu cần
                           }
                       }
                       resolve();
                   },
                   error: (err: HttpErrorResponse) => {
                       this.handleFetchError(err, `deleting translation ${translationId}`);
                       reject(err);
                   }
               });
       });
  }

  publishLanguageVariant(originalPost: PostForDisplay, translation: Post): void {
       if (translation.status === 'published') return;
       if (!originalPost || !translation?.id) {
            this.message.error('Bản dịch không tìm thấy.');
            return;
       }
       originalPost.loadingTranslations = true;
       const updateDto: Partial<PostDto> = { status: 'published' };

       // Service PostService.update() của bạn
       this.postService.update(translation.id, updateDto)
          .pipe(finalize(() => originalPost.loadingTranslations = false ))
           .subscribe({
               next: (updatedVariantFromApi) => {
                   this.message.success('Bản dịch đã được xuất bản.');
                   if (originalPost.translations) {
                       const variantIndex = originalPost.translations.findIndex(v => v.id === updatedVariantFromApi.id);
                       if (variantIndex > -1) {
                            // Cập nhật lại variant trong mảng translations
                            originalPost.translations[variantIndex] = {
                                ...updatedVariantFromApi,
                                expand: originalPost.translations[variantIndex].expand // Giữ lại trạng thái expand của variant (nếu có)
                            };
                       }
                   }
               },
               error: (err: HttpErrorResponse) => this.handleFetchError(err, `publishing translation ${translation.id}`)
           });
   }

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
       default: return 'default';
     }
   }

   // Truy cập User.avatar từ model Post
   getAuthorAvatar(user: Post['User']): string { // Type hint là Post['User'] để rõ ràng
       return user?.avatar || 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png';
   }

    getPaginationInfo(): string {
    if (this.total === 0) return 'Không có bài viết nào.';
      const startIndex = (this.pageIndex - 1) * this.pageSize + 1;
      const endIndex = Math.min(startIndex + this.pageSize - 1, this.total);
    return `Hiển thị <strong>${startIndex}</strong> đến <strong>${endIndex}</strong> trong tổng số <strong>${this.total}</strong> bài viết`;
    }
}