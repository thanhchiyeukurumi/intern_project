import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

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

// Import các service
import { PostService } from '../../../../core/services/post.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Post } from '../../../../shared/models/post.model';
import { Category } from '../../../../shared/models/category.model';

// Interface để định nghĩa cấu trúc dữ liệu
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
}

interface RandomPost {
  id: number;
  title: string;
  url: string;
  image?: string | null;
  date?: string;
}

interface Topic {
  id: number;
  name: string;
  slug: string;
}

interface Filter {
  type: 'category' | 'tag' | 'search';
  id?: number;
  name: string;
  value: string | number;
}

@Component({
  selector: 'app-home-detail',
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
    NzEmptyModule
  ],
  templateUrl: './home-detail.component.html',
  styleUrls: ['./home-detail.component.css']
})
export class HomeDetailComponent implements OnInit, OnDestroy {
  // Dữ liệu bài viết
  posts: PostPreview[] = [];
  randomPosts: RandomPost[] = [];
  recommendedTopics: Topic[] = [];
  featuredPost: PostPreview | null = null;
  
  // Biến cho phân trang và tải dữ liệu
  currentPage: number = 1;
  pageSize: number = 5;
  loading: boolean = false;
  hasMorePosts: boolean = true;
  
  // Biến cho search và filter
  searchQuery: string = '';
  activeFilters: Filter[] = [];
  primaryColor: string = '#1890ff';
  emailSubscribe: string = '';
  
  // Biến cho back-to-top
  showBackToTop: boolean = false;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private postService: PostService,
    private categoryService: CategoryService,
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

    this.loadPosts();
    this.loadRandomPosts();
    this.loadCategories();
    this.loadFeaturedPost();
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
  addFilter(topic: Topic): void {
    const existingIndex = this.activeFilters.findIndex(f => 
      f.type === 'category' && f.value === topic.id);
    
    if (existingIndex < 0) {
      this.activeFilters.push({
        type: 'category',
        id: topic.id,
        name: topic.name,
        value: topic.id
      });
      this.resetPostsAndReload();
    }
  }

  // Xóa filter
  removeFilter(index: number): void {
    this.activeFilters.splice(index, 1);
    
    // Đồng bộ searchQuery với filter
    const searchFilter = this.activeFilters.find(f => f.type === 'search');
    this.searchQuery = searchFilter ? searchFilter.value as string : '';
    
    this.resetPostsAndReload();
  }

  // Reset filters
  resetFilters(): void {
    this.activeFilters = [];
    this.searchQuery = '';
    this.resetPostsAndReload();
  }

  // Reset bài viết và tải lại
  private resetPostsAndReload(): void {
    this.posts = [];
    this.currentPage = 1;
    this.hasMorePosts = true;
    this.loadPosts();
  }

  // Tải bài viết chính
  loadPosts(): void {
    if (this.loading) return;
    this.loading = true;

    const params: any = {
      page: this.currentPage,
      limit: this.pageSize,
      orderBy: 'createdAt',
      order: 'DESC',
      includeRelations: true
    };

    // Áp dụng các filter
    this.activeFilters.forEach(filter => {
      if (filter.type === 'search') {
        params.search = filter.value;
      } else if (filter.type === 'category') {
        params.categoryId = filter.value;
      }
    });

    this.postService.getAll(params)
    .pipe(
      finalize(() => this.loading = false),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (response) => {
        const newPosts = response.data.map(post => this.mapPostToPreview(post));
        this.posts = [...this.posts, ...newPosts];
        
        // Kiểm tra xem còn bài viết để tải không
        if (response.data.length < this.pageSize) {
          this.hasMorePosts = false;
        }
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.messageService.error('Không thể tải bài viết. Vui lòng thử lại sau.');
      }
    });
  }

  // Tải bài viết featured (bài viết nổi bật nhất)
  loadFeaturedPost(): void {
    this.postService.getAll({
      page: 1,
      limit: 1,
      orderBy: 'views', // Sắp xếp theo lượt xem
      order: 'DESC',
      includeRelations: true
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.data.length > 0) {
          const post = response.data[0];
          this.featuredPost = this.mapPostToPreview(post);
          this.featuredPost.image = post.excerpt || 'assets/images/featured-placeholder.jpg';
          this.featuredPost.views = post.views;
        }
      },
      error: (error) => {
        console.error('Error loading featured post:', error);
      }
    });
  }

  // Tải bài viết ngẫu nhiên (ở đây dùng bài viết mới nhất)
  loadRandomPosts(): void {
    this.postService.getAll({
      page: 1,
      limit: 5,
      orderBy: 'createdAt',
      order: 'DESC'
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.randomPosts = response.data.map(post => ({
          id: post.id,
          title: post.title,
          url: `/post/${post.id}`,
          image: post.excerpt || null, // Sử dụng excerpt như là thumbnail nếu có
          date: this.formatDate(new Date(post.createdAt))
        }));
      },
      error: (error) => {
        console.error('Error loading random posts:', error);
      }
    });
  }

  // Tải danh mục cho recommended topics
  loadCategories(): void {
    this.categoryService.getAll({
      limit: 8,
      orderBy: 'name',
      order: 'ASC'
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.recommendedTopics = response.data.map((category: Category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug || category.id.toString()
        }));
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  // Tải thêm bài viết
  loadMorePosts(): void {
    if (this.loading || !this.hasMorePosts) return;
    
    this.currentPage++;
    this.loadPosts();
  }

  // Đăng ký nhận thông báo
  subscribeNewsletter(): void {
    if (!this.emailSubscribe || !this.validateEmail(this.emailSubscribe)) {
      this.messageService.error('Vui lòng nhập email hợp lệ');
      return;
    }

    // Demo - thường sẽ có API để xử lý đăng ký
    this.messageService.success(`Đã đăng ký ${this.emailSubscribe} thành công!`);
    this.emailSubscribe = '';
  }

  // Kiểm tra xem bài viết có phải là mới hay không (trong vòng 3 ngày)
  isNewPost(post: PostPreview): boolean {
    if (!post.createdAt) return false;
    
    const postDate = new Date(post.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 3;
  }

  // Hàm hỗ trợ chuyển đổi Post từ API sang PostPreview
  private mapPostToPreview(post: Post): PostPreview {
    // Lấy avatar của tác giả hoặc dùng avatar mặc định
    const authorAvatar = post.User?.avatar || 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256';
    
    // Format ngày tháng
    const createdAt = new Date(post.createdAt);
    const formattedDate = this.formatDate(createdAt);
    
    return {
      id: post.id,
      title: post.title,
      authorAvatar: authorAvatar,
      authorName: post.User?.username,
      description: post.description || post.excerpt || 'Không có mô tả',
      date: formattedDate,
      commentCount: 0, // Giả sử không có thông tin comment
      views: post.views,
      createdAt: createdAt
    };
  }

  // Hàm định dạng ngày tháng đơn giản
  private formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return 'Hôm nay';
    } else if (diffDays <= 2) {
      return 'Hôm qua';
    } else if (diffDays <= 7) {
      return `${diffDays} ngày trước`;
    } else {
      // Format: 'Sep 22, 2024'
      return date.toLocaleDateString('vi-VN', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  }

  // Validate email
  private validateEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }
}