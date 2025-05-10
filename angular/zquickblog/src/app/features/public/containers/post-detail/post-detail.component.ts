import { Component, OnInit, OnDestroy, Pipe, PipeTransform, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { switchMap, takeUntil, catchError, finalize } from 'rxjs/operators';

// NG-ZORRO Modules
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';

// Services
import { PostService } from '../../../../core/services/post.service';
import { CommentService } from '../../../../core/services/comment.service';
import { AuthService } from '../../../../core/services/auth.service';

// Models
import { Post } from '../../../../shared/models/post.model';
import { CommentDto, Comment as CommentModel } from '../../../../shared/models/comment.model';
import { Category } from '../../../../shared/models/category.model';
import { User } from '../../../../shared/models/user.model';

// Interface cho API Response
interface ApiResponse<T> {
  success: boolean;
  data: T;
  status: number;
  message: string;
}

// Interfaces cho UI
interface AuthorInfo {
  id: number;
  name: string;
  avatarUrl: string;
  profileLink?: string;
}

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: AuthorInfo;
  publishedDate: string;
  readTimeMinutes: number;
  tags: string[];
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
}

interface SidebarPost {
  id: number;
  title: string;
  authorName: string;
  postLink: string;
}

// --- Security Pipe for [innerHTML] ---
@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DatePipe,
    NzGridModule,
    NzAvatarModule,
    NzTypographyModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzCardModule,
    NzDividerModule,
    NzListModule,
    NzSkeletonModule,
    NzCommentModule,
    NzEmptyModule,
    NzFormModule,
    NzInputModule,
    NzSpinModule,
    SafeHtmlPipe,
  ],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
  encapsulation: ViewEncapsulation.None //fix loi anh
})
export class PostDetailComponent implements OnInit, OnDestroy {
  // Dữ liệu bài viết
  post: BlogPost | null = null;
  originalPost: Post | null = null;
  recommendedPosts: SidebarPost[] = [];
  isLoading = true;
  
  // Bình luận
  comments: CommentModel[] = [];
  commentContent: string = '';
  isLoadingComments = false;
  submittingComment = false;
  
  // Trạng thái người dùng
  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  
  // Biến cho back-to-top
  showBackToTop: boolean = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private messageService: NzMessageService,
    private postService: PostService,
    private commentService: CommentService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Kiểm tra đăng nhập
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });

    // Lấy ID bài viết từ URL và tải dữ liệu
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const postId = params.get('id');
        if (!postId) {
          this.isLoading = false;
          return of(null);
        }
        
        this.isLoading = true;
        console.log('Đang tải bài viết với ID:', postId);
        return this.postService.getById(postId).pipe(
          catchError((error: any) => {
            this.messageService.error('Không thể tải bài viết. Vui lòng thử lại sau.');
            console.error('Error fetching post:', error);
            return of(null);
          }),
          finalize(() => {
            this.isLoading = false;
          })
        );
      })
    ).subscribe((response: any) => {
      //************** */
      console.log('Dữ liệu bài viết nhận được:', response);
      if (response && response.success && response.data) {
        const post = response.data as Post;
        this.originalPost = post;
        this.post = this.mapPostToViewModel(post);
        //****************   */
        console.log('Sau khi chuyển đổi:', this.post);
        this.loadComments(post.id);
        this.loadRecommendedPosts();
      } else {
        console.log('Không nhận được dữ liệu bài viết hoặc dữ liệu không hợp lệ');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  //fix anh
  // Sau phần ngOnDestroy, thêm hàm:
ngAfterViewChecked() {
  // Tìm tất cả hình ảnh trong nội dung bài viết
  if (document) {
    const images = document.querySelectorAll('.post-body img');
    if (images.length > 0) {
      images.forEach(img => {
        img.setAttribute('style', 'max-width: 100%; height: auto; display: block; margin: 1rem auto; border-radius: 0.5rem;');
      });
    }
  }
}


  // Theo dõi scroll để hiển thị nút back-to-top
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showBackToTop = window.scrollY > 500;
  }

  // Chuyển đổi dữ liệu bài viết từ API sang định dạng hiển thị
  private mapPostToViewModel(post: Post): BlogPost {
    console.log('mapPostToViewModel - đầu vào:', post);
    console.log('post.Categories:', post.Categories);
    console.log('post.User:', post.User);
    
    // Tính thời gian đọc dựa trên số từ trong nội dung (trung bình 200 từ/phút)
    const contentText = this.stripHtmlTags(post.content || '');
    const wordCount = contentText.split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    
    // Format ngày tháng
    const publishedDate = new Date(post.createdAt).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const result: BlogPost = {
      id: post.id,
      title: post.title,
      content: post.content || '',
      author: {
        id: post.user_id,
        name: post.User?.username || 'Người dùng ẩn danh',
        avatarUrl: post.User?.avatar || './public/images/default-avatar.png',
        profileLink: `/blogger/${post.user_id}`
      },
      publishedDate: publishedDate,
      readTimeMinutes: readTimeMinutes,
      tags: post.Categories?.map(cat => cat.name) || [],
      categories: post.Categories?.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/\s+/g, '-')
      })) || []
    };
    
    console.log('mapPostToViewModel - kết quả:', result);
    return result;
  }

  // Loại bỏ thẻ HTML để tính số từ
  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Tải bình luận cho bài viết
  loadComments(postId: number): void {
    this.isLoadingComments = true;
    this.commentService.getByPost(postId, {
      orderBy: 'created_at',
      order: 'DESC',
      limit: 50
    })
    .pipe(
      finalize(() => this.isLoadingComments = false),
      catchError(error => {
        console.error('Error loading comments:', error);
        this.messageService.error('Không thể tải bình luận. Vui lòng thử lại sau.');
        return of(null);
      }),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (response: any) => {
        console.log('Dữ liệu bình luận:', response);
        if (response && response.data) {
          this.comments = response.data as CommentModel[];
        } else {
          this.comments = [];
        }
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.messageService.error('Không thể tải bình luận. Vui lòng thử lại sau.');
      }
    });
  }

  // Tải các bài viết đề xuất
  loadRecommendedPosts(): void {
    if (!this.originalPost) return;
    
    // Lấy bài viết từ cùng danh mục
    const categoryIds = this.originalPost.Categories?.map(cat => cat.id) || [];
    if (categoryIds.length === 0) {
      // Nếu không có danh mục, lấy bài viết mới nhất
      this.loadLatestPosts();
      return;
    }
    
    // Lấy bài viết từ danh mục đầu tiên
    this.postService.getByCategory(categoryIds[0], {
      limit: 5,
      orderBy: 'createdAt',
      order: 'DESC'
    })
    .pipe(
      catchError(error => {
        console.error('Error loading recommended posts:', error);
        this.loadLatestPosts(); // Fallback to latest posts
        return of(null);
      }),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (response: any) => {
        console.log('Dữ liệu bài viết đề xuất:', response);
        if (response && response.data) {
          // Lọc bỏ bài viết hiện tại
          const filteredPosts = response.data.filter((p: any) => p.id !== this.originalPost?.id);
          this.recommendedPosts = filteredPosts.slice(0, 4).map((post: any) => ({
            id: post.id,
            title: post.title,
            authorName: post.User?.username || 'Người dùng ẩn danh',
            postLink: `/post/${post.id}`
          }));
          
          // Nếu không đủ bài viết đề xuất, bổ sung thêm bài viết mới nhất
          if (this.recommendedPosts.length < 4) {
            this.loadLatestPosts(4 - this.recommendedPosts.length);
          }
        }
      },
      error: (error) => {
        console.error('Error loading recommended posts:', error);
        this.loadLatestPosts(); // Fallback to latest posts
      }
    });
  }

  // Tải bài viết mới nhất
  loadLatestPosts(limit: number = 4): void {
    this.postService.getAll({
      limit: limit + 1, // +1 để dự phòng lọc bài hiện tại
      orderBy: 'createdAt',
      order: 'DESC'
    })
    .pipe(
      catchError(error => {
        console.error('Error loading latest posts:', error);
        return of(null);
      }),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (response: any) => {
        console.log('Dữ liệu bài viết mới nhất:', response);
        if (response && response.data) {
          // Lọc bỏ bài viết hiện tại và giới hạn số lượng
          const filteredPosts = response.data
            .filter((p: any) => p.id !== this.originalPost?.id)
            .slice(0, limit);
            
          // Nếu đã có bài đề xuất, thêm vào (tránh trùng lặp)
          if (this.recommendedPosts.length > 0) {
            const existingIds = this.recommendedPosts.map(p => p.id);
            const newPosts = filteredPosts
              .filter((p: any) => !existingIds.includes(p.id))
              .map((post: any) => ({
                id: post.id,
                title: post.title,
                authorName: post.User?.username || 'Người dùng ẩn danh',
                postLink: `/post/${post.id}`
              }));
              
            this.recommendedPosts = [...this.recommendedPosts, ...newPosts].slice(0, 4);
          } else {
            // Nếu chưa có bài đề xuất nào, gán trực tiếp
            this.recommendedPosts = filteredPosts.map((post: any) => ({
              id: post.id,
              title: post.title,
              authorName: post.User?.username || 'Người dùng ẩn danh',
              postLink: `/post/${post.id}`
            }));
          }
        }
      },
      error: (error) => {
        console.error('Error loading latest posts:', error);
      }
    });
  }

  // Gửi bình luận mới
  submitComment(): void {
    if (!this.isCommentValid()) return;
    if (!this.originalPost) return;
    
    this.submittingComment = true;
    const commentData: CommentDto = {
      content: this.commentContent
    };
    
    this.commentService.create(this.originalPost.id, commentData)
      .pipe(
        finalize(() => this.submittingComment = false),
        catchError(error => {
          console.error('Error submitting comment:', error);
          this.messageService.error('Không thể đăng bình luận. Vui lòng thử lại sau.');
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (comment) => {
          if (comment) {
            this.messageService.success('Đã đăng bình luận thành công!');
            this.loadComments(this.originalPost!.id); // Tải lại bình luận
    this.resetCommentForm();
  }
        },
        error: (error) => {
          console.error('Error submitting comment:', error);
          this.messageService.error('Không thể đăng bình luận. Vui lòng thử lại sau.');
        }
      });
  }

  // Kiểm tra bình luận hợp lệ
  isCommentValid(): boolean {
    return this.commentContent.trim().length > 0 && this.isLoggedIn;
  }

  // Reset form bình luận
  resetCommentForm(): void {
    this.commentContent = '';
  }

  // Format thời gian bình luận
  formatCommentDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Trong ngày hôm nay
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes === 0 ? 'Vừa xong' : `${diffMinutes} phút trước`;
      }
      return `${diffHours} giờ trước`;
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  }

  // Chia sẻ bài viết
  sharePost(): void {
    if (!this.post) return;
    
    // Nếu API Share có sẵn, sử dụng
    if (navigator.share) {
      navigator.share({
        title: this.post.title,
        text: `Đọc bài viết "${this.post.title}" của ${this.post.author.name}`,
        url: window.location.href
      })
      .then(() => this.messageService.success('Đã chia sẻ bài viết thành công!'))
      .catch((error) => console.error('Không thể chia sẻ:', error));
    } else {
      // Sao chép URL vào clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => this.messageService.success('Đã sao chép đường dẫn bài viết!'))
        .catch((error) => console.error('Không thể sao chép:', error));
    }
  }

  // Cuộn lên đầu trang
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}