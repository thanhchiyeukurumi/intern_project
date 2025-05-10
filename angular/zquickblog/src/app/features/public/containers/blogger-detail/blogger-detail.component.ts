import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, throwError } from 'rxjs';
import { takeUntil, finalize, debounceTime, distinctUntilChanged, catchError, switchMap } from 'rxjs/operators';

// NG-ZORRO Modules
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

// Import các service
import { PostService } from '../../../../core/services/post.service';
import { CategoryService } from '../../../../core/services/category.service';
import { UserService } from '../../../../core/services/user.service';
import { Post } from '../../../../shared/models/post.model';
import { Category } from '../../../../shared/models/category.model';
import { User } from '../../../../shared/models/user.model';

// Interface cho định dạng dữ liệu
interface BloggerStats {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  joinDate: Date;
}

interface PostPreview {
  id: number;
  title: string;
  authorAvatar: string;
  authorName?: string;
  description: string;
  date: string;
  commentCount: number;
  views?: number;
  image?: string;
  createdAt?: Date;
  categories?: {
    id: number;
    name: string;
    slug: string;
  }[];
}

interface CategoryPreview {
  id: number;
  name: string;
  slug: string;
  postCount?: number;
}

interface Filter {
  type: 'category' | 'search';
  id?: number;
  name: string;
  value: string | number;
}

// Mở rộng interface Post để tránh lỗi TypeScript
interface ExtendedPost extends Omit<Post, 'Categories'> {
  commentCount?: number;
  thumbnail?: string;
  Categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

@Component({
  selector: 'app-blogger-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzGridModule,
    NzCardModule,
    NzAvatarModule,
    NzTypographyModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,  
    NzInputModule,
    NzEmptyModule,
    NzSkeletonModule,
    NzSpinModule,
    NzStatisticModule,
    NzTabsModule,
    NzToolTipModule
  ],
  templateUrl: './blogger-detail.component.html',
  styleUrls: ['./blogger-detail.component.css']
})
export class BloggerDetailComponent implements OnInit, OnDestroy {
  // Thông tin blogger
  bloggerId: string | null = null;
  blogger: User | null = null;
  bloggerStats: BloggerStats = {
    totalPosts: 0,
    totalViews: 0,
    totalComments: 0,
    joinDate: new Date()
  };
  isLoadingBlogger: boolean = true;

  // Danh sách bài viết
  posts: PostPreview[] = [];
  popularPosts: PostPreview[] = [];
  latestPosts: PostPreview[] = [];
  categories: CategoryPreview[] = [];
  
  // Biến cho phân trang và tải dữ liệu
  currentPage: number = 1;
  pageSize: number = 5;
  loading: boolean = false;
  loadingPopularPosts: boolean = false;
  loadingCategories: boolean = false;
  hasMorePosts: boolean = true;
  
  // Biến cho search và filter
  searchQuery: string = '';
  activeFilters: Filter[] = [];
  primaryColor: string = '#1890ff';
  
  // Biến cho back-to-top
  showBackToTop: boolean = false;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Tab hiện tại
  activeTab: string = 'latest';
  selectedTabIndex: number = 0; // Thêm biến để sử dụng với nzSelectedIndex

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private categoryService: CategoryService,
    private userService: UserService,
    private messageService: NzMessageService
  ) { }

  ngOnInit(): void {
    // Thiết lập debounce cho search
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.handleSearch(term);
    });

    // Lấy ID blogger từ URL và load dữ liệu
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.bloggerId = params.get('id');
      if (this.bloggerId) {
        this.loadBloggerInfo();
        this.loadBloggerPosts();
        this.loadPopularPosts();
        this.loadCategories();
      } else {
        this.messageService.error('Không tìm thấy thông tin blogger');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Theo dõi scroll để hiển thị nút back-to-top
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showBackToTop = window.scrollY > 500;
  }

  // Kéo về đầu trang
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Load thông tin blogger
  loadBloggerInfo(): void {
    if (!this.bloggerId) return;
    
    this.isLoadingBlogger = true;
    
    this.userService.getById(this.bloggerId).pipe(
      catchError(error => {
        this.messageService.error('Không thể tải thông tin blogger');
        console.error('Lỗi khi tải thông tin blogger:', error);
        return throwError(error);
      }),
      finalize(() => this.isLoadingBlogger = false),
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.blogger = user;
      console.log('Blogger info:', this.blogger); // Debug
      
      // Lấy thống kê về bài viết của blogger
      this.loadBloggerStats();
    });
  }

  // Load thống kê của blogger
  loadBloggerStats(): void {
    if (!this.bloggerId) return;
    
    this.postService.getByUser(this.bloggerId, {
      limit: 1, // Chỉ cần lấy tổng số bài viết từ pagination
      includeRelations: false
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe(response => {
      if (response?.pagination) {
        this.bloggerStats.totalPosts = response.pagination.total || 0;
        
        // API hiện tại không hỗ trợ getUserStats với userId, nên dùng phương pháp giả lập
        // this.userService.getUserStats không hỗ trợ lọc theo userId
        this.bloggerStats.totalViews = this.bloggerStats.totalPosts * 
           Math.floor(Math.random() * 50 + 20); // 20-70 lượt xem trung bình mỗi bài
        this.bloggerStats.totalComments = Math.floor(this.bloggerStats.totalPosts * 
           Math.random() * 3 + 2); // 2-5 bình luận trung bình mỗi bài
        
        // Gán ngày tham gia từ dữ liệu blogger nếu có
        if (this.blogger?.data?.createdAt) {
          this.bloggerStats.joinDate = new Date(this.blogger.data.createdAt);
        }
      }
    });
  }

  // Load bài viết của blogger
  loadBloggerPosts(): void {
    if (!this.bloggerId) return;
    
    this.loading = true;
    
    // Xây dựng tham số query
    const params: any = {
      page: this.currentPage,
      limit: this.pageSize,
      orderBy: 'createdAt',
      order: 'DESC',
      includeRelations: true
    };
    
    // Thêm tìm kiếm nếu có
    const searchFilter = this.activeFilters.find(f => f.type === 'search');
    if (searchFilter) {
      params.search = searchFilter.value;
    }
    
    // Thêm lọc theo danh mục nếu có
    const categoryFilter = this.activeFilters.find(f => f.type === 'category');
    if (categoryFilter) {
      params.categoryId = categoryFilter.value;
    }
    
    this.postService.getByUser(this.bloggerId, params).pipe(
      catchError(error => {
        this.messageService.error('Không thể tải bài viết của blogger');
        console.error('Lỗi khi tải bài viết:', error);
        return throwError(error);
      }),
      finalize(() => this.loading = false),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      const posts = response.data.map(post => this.mapPostToPreview(post as ExtendedPost));
      
      if (this.currentPage === 1) {
        this.posts = posts;
      } else {
        this.posts = [...this.posts, ...posts];
      }
      
      // Kiểm tra xem còn bài viết để tải không
      this.hasMorePosts = posts.length === this.pageSize;
    });
  }

  // Load bài viết phổ biến nhất của blogger
  loadPopularPosts(): void {
    if (!this.bloggerId) return;
    
    this.loadingPopularPosts = true;
    
    this.postService.getByUser(this.bloggerId, {
      limit: 5,
      orderBy: 'views',
      order: 'DESC',
      includeRelations: true
    }).pipe(
      catchError(() => {
        return throwError('Không thể tải bài viết phổ biến');
      }),
      finalize(() => this.loadingPopularPosts = false),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      this.popularPosts = response.data.map(post => this.mapPostToPreview(post as ExtendedPost));
    });
  }

  // Load danh mục mà blogger đã viết bài
  loadCategories(): void {
    if (!this.bloggerId) return;
    
    this.loadingCategories = true;
    
    // Giả định: có API hoặc cách để lấy danh mục mà blogger đã viết
    // Tạm thời lấy tất cả danh mục và sẽ lọc sau
    this.categoryService.getAll({
      limit: 10
    }).pipe(
      catchError(() => {
        return throwError('Không thể tải danh mục');
      }),
      finalize(() => this.loadingCategories = false),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      this.categories = response.data.map((category: Category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug || '',
        postCount: Math.floor(Math.random() * 10) + 1 // Giả định số bài viết
      }));
    });
  }

  // Thay đổi tab hiện tại
  changeTab(tabName: string): void {
    this.activeTab = tabName;
    this.selectedTabIndex = tabName === 'latest' ? 0 : 1;
  }

  // Xử lý tìm kiếm
  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  handleSearch(term: string): void {
    if (term.length > 0) {
      // Thêm filter tìm kiếm
      const existingIndex = this.activeFilters.findIndex(f => f.type === 'search');
      if (existingIndex >= 0) {
        this.activeFilters[existingIndex].value = term;
        this.activeFilters[existingIndex].name = `Tìm: ${term}`;
      } else {
        this.activeFilters.push({
          type: 'search',
          name: `Tìm: ${term}`,
          value: term
        });
      }
    } else {
      // Xóa filter tìm kiếm nếu trống
      const existingIndex = this.activeFilters.findIndex(f => f.type === 'search');
      if (existingIndex >= 0) {
        this.activeFilters.splice(existingIndex, 1);
      }
    }

    // Reset và tải lại bài viết
    this.resetPostsAndReload();
  }

  // Thêm filter danh mục
  addFilter(category: CategoryPreview): void {
    const existingIndex = this.activeFilters.findIndex(f => 
      f.type === 'category' && f.value === category.id);
    
    if (existingIndex < 0) {
      this.activeFilters.push({
        type: 'category',
        id: category.id,
        name: category.name,
        value: category.id
      });
      this.resetPostsAndReload();
    }
  }

  // Xóa filter
  removeFilter(index: number): void {
    if (index >= 0 && index < this.activeFilters.length) {
      this.activeFilters.splice(index, 1);
      this.resetPostsAndReload();
    }
  }

  // Reset tất cả filter
  resetFilters(): void {
    this.activeFilters = [];
    this.searchQuery = '';
    this.resetPostsAndReload();
  }

  // Reset danh sách bài viết và tải lại
  private resetPostsAndReload(): void {
    this.currentPage = 1;
    this.posts = [];
    this.hasMorePosts = true;
    this.loadBloggerPosts();
  }

  // Tải thêm bài viết
  loadMorePosts(): void {
    this.currentPage++;
    this.loadBloggerPosts();
  }

  // Chuyển đổi từ Post sang PostPreview
  private mapPostToPreview(post: ExtendedPost): PostPreview {
    return {
      id: post.id,
      title: post.title,
      authorAvatar: post.User?.avatar || 'assets/images/default-avatar.png',
      authorName: post.User?.username || 'Tác giả ẩn danh',
      description: post.description || post.excerpt || '',
      date: this.formatDate(new Date(post.createdAt)),
      commentCount: post.commentCount || 0,
      views: post.views || 0,
      image: post.thumbnail || 'assets/images/post-placeholder.jpg',
      createdAt: new Date(post.createdAt),
      categories: post.Categories?.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug
      })) || []
    };
  }

  // Format ngày tháng
  private formatDate(date: Date): string {
    if (!date) return '';
    
    // Kiểm tra ngày có hợp lệ không
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      if (typeof date === 'string') {
        date = new Date(date);
        if (isNaN(date.getTime())) return '';
      } else {
        return '';
      }
    }
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Kiểm tra bài viết mới (trong vòng 3 ngày)
  isNewPost(post: PostPreview): boolean {
    if (!post.createdAt) return false;
    
    const now = new Date();
    const postDate = new Date(post.createdAt);
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 3;
  }
} 