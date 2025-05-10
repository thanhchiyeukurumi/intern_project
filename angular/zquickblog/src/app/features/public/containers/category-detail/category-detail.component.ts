import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { catchError, finalize, map, Subject, takeUntil } from 'rxjs';
import { of, forkJoin } from 'rxjs';

// Services
import { CategoryService } from '../../../../core/services/category.service';
import { PostService } from '../../../../core/services/post.service';

// Models
import { Category } from '../../../../shared/models/category.model';
import { Post } from '../../../../shared/models/post.model';

// Interface đơn giản cho chủ đề liên quan
interface RelatedTopic {
    name: string;
    slug: string;
    id: string;
}

// Interface mở rộng cho danh mục
interface CategoryInfo extends Category {
  storyCount?: number;
}

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzGridModule,
    NzCardModule,
    NzAvatarModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSkeletonModule,
    NzToolTipModule
  ],
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CategoryDetailComponent implements OnInit, OnDestroy {
  // Dữ liệu cơ bản
  category: CategoryInfo | null = null;
  featuredPost: Post | null = null;
  trendingPosts: Post[] = [];
  latestPosts: Post[] = [];
  relatedTopics: RelatedTopic[] = [];
  
  // Trạng thái
  isLoading = true;
  currentPage = 1;
  postsPerPage = 4;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private postService: PostService,
    private messageService: NzMessageService
  ) { }

  ngOnInit(): void {
    // Lấy slug danh mục từ URL và tải dữ liệu
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const categoryId = params.get('id');
      if (categoryId) {
        this.loadCategoryData(categoryId);
      } else {
        this.isLoading = false;
        this.messageService.error('Không tìm thấy mã danh mục');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Tải dữ liệu danh mục và bài viết
  loadCategoryData(categoryId: string): void {
    this.isLoading = true;

    // Lấy thông tin danh mục
    const categoryRequest = this.categoryService.getById(categoryId).pipe(
      map(response => {
        // Chuyển đổi từ CategoryDto sang CategoryInfo
        if (response) {
          return {
            ...response,
            storyCount: 0
          } as CategoryInfo;
        }
        return null;
      }),
      catchError(error => {
        console.error('Lỗi khi tải thông tin danh mục:', error);
        this.messageService.error('Không thể tải thông tin danh mục');
        return of(null);
      })
    );

    // Lấy bài viết nổi bật (lượt xem cao nhất)
    const featuredPostRequest = this.postService.getByCategory(categoryId, {
      limit: 1,
      orderBy: 'views',
      order: 'DESC'
    }).pipe(
      map(response => response.data.length > 0 ? response.data[0] : null),
      catchError(() => of(null))
    );

    // Lấy bài viết xu hướng
    const trendingPostsRequest = this.postService.getByCategory(categoryId, {
      limit: 3,
      orderBy: 'views',
      order: 'DESC',
      page: 2
    }).pipe(
      map(response => response.data),
      catchError(() => of([]))
    );

    // Lấy bài viết mới nhất
    const latestPostsRequest = this.postService.getByCategory(categoryId, {
      limit: this.postsPerPage,
      orderBy: 'createdAt',
      order: 'DESC'
    }).pipe(
      map(response => response.data),
      catchError(() => of([]))
    );

    // Kết hợp tất cả các request
    forkJoin({
      category: categoryRequest,
      featuredPost: featuredPostRequest,
      trendingPosts: trendingPostsRequest,
      latestPosts: latestPostsRequest
    }).pipe(
      finalize(() => this.isLoading = false),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      this.category = result.category;
      this.featuredPost = result.featuredPost;
      this.trendingPosts = result.trendingPosts;
      this.latestPosts = result.latestPosts;
      
      // Tạo danh sách chủ đề liên quan
      this.createRelatedTopics();
    });
  }

  // Tải thêm bài viết khi click nút "Xem thêm"
  loadMoreLatestPosts(): void {
    if (!this.category) return;
    
    this.currentPage++;
    this.postService.getByCategory(this.category.id, {
      page: this.currentPage,
      limit: this.postsPerPage,
      orderBy: 'createdAt',
      order: 'DESC'
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: response => {
        if (response.data.length > 0) {
          this.latestPosts = [...this.latestPosts, ...response.data];
        } else {
          this.messageService.info('Không còn bài viết nào để hiển thị.');
        }
      },
      error: () => this.messageService.error('Không thể tải thêm bài viết.')
    });
  }

  // Tạo các chủ đề liên quan từ dữ liệu thực tế
  createRelatedTopics(): void {
    if (!this.category) return;
    
    // Lấy danh sách danh mục ngẫu nhiên từ service
    this.categoryService.getAll({
      limit: 6 // Giới hạn số lượng danh mục liên quan
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        // Lọc ra các danh mục khác với danh mục hiện tại
        this.relatedTopics = response.data
          .filter((cat: Category) => cat.id !== this.category?.id)
          .map((cat: Category) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug
          }))
          .slice(0, 5); // Chỉ lấy tối đa 5 danh mục
      },
      error: () => {
        // Nếu có lỗi, sử dụng danh sách mặc định
        this.messageService.error('Không thể tải danh mục liên quan.');
        this.relatedTopics = [];
      }
    });
  }

  // Helper: Quay lại đầu trang
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Helper: Format số lượng bài viết (ví dụ: 12800 -> 12.8K)
  formatStoryCount(count: number): string {
      if (count >= 1000) {
          return (count / 1000).toFixed(1) + 'K';
      }
      return count.toString();
  }

  // Helper: Format ngày tháng
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric'
    });
  }

  // Helper: Ước tính thời gian đọc
  estimateReadTime(content: string): number {
    if (!content) return 1;
    
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }
}