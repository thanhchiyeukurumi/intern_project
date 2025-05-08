import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid'; // Cho layout grid
import { NzCardModule } from 'ng-zorro-antd/card'; // Cho các post preview
import { NzAvatarModule } from 'ng-zorro-antd/avatar'; // Cho avatar tác giả
import { NzTypographyModule } from 'ng-zorro-antd/typography'; // Cho styling text
import { NzTagModule } from 'ng-zorro-antd/tag'; // Cho recommended topics
import { NzButtonModule } from 'ng-zorro-antd/button'; // Cho nút "Explore More"
import { finalize } from 'rxjs/operators';

// Import các service
import { PostService } from '../../../../core/services/post.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Post } from '../../../../shared/models/post.model';
import { Category } from '../../../../shared/models/category.model';

// Interface (tùy chọn) để định nghĩa cấu trúc dữ liệu
interface PostPreview {
  id: number;
  title: string;
  authorAvatar: string;
  description: string;
  date: string;
  commentCount: number;
}

interface RandomPost {
  id: number;
  title: string;
  url: string;
}

interface Topic {
  name: string;
  slug: string; // Để dùng cho routerLink
}

@Component({
  selector: 'app-home-detail', // Đổi selector nếu cần
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzGridModule,
    NzCardModule,
    NzAvatarModule,
    NzTypographyModule,
    NzTagModule,
    NzButtonModule
  ],
  templateUrl: './home-detail.component.html',
  styleUrls: ['./home-detail.component.css']
})
export class HomeDetailComponent implements OnInit {
  posts: PostPreview[] = [];
  randomPosts: RandomPost[] = [];
  recommendedTopics: Topic[] = [];
  
  // Biến cho phân trang và tải dữ liệu
  currentPage: number = 1;
  pageSize: number = 5;
  loading: boolean = false;
  hasMorePosts: boolean = true;

  constructor(
    private postService: PostService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.loadPosts();
    this.loadRandomPosts();
    this.loadCategories();
  }

  // Tải bài viết chính
  loadPosts(): void {
    this.loading = true;
    this.postService.getAll({
      page: this.currentPage,
      limit: this.pageSize,
      orderBy: 'createdAt',
      order: 'DESC',
      includeRelations: true
    })
    .pipe(
      finalize(() => this.loading = false)
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
      }
    });
  }

  // Tải bài viết ngẫu nhiên (ở đây dùng bài viết mới nhất)
  loadRandomPosts(): void {
    this.postService.getAll({
      page: 1,
      limit: 3,
      orderBy: 'createdAt',
      order: 'DESC'
    })
    .subscribe({
      next: (response) => {
        this.randomPosts = response.data.map(post => ({
          id: post.id,
          title: post.title,
          url: `/post/${post.id}`
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
      limit: 6,
      orderBy: 'name',
      order: 'ASC'
    })
    .subscribe({
      next: (response) => {
        this.recommendedTopics = response.data.map((category: Category) => ({
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
      description: post.description || post.excerpt || 'No description available',
      date: formattedDate,
      commentCount: 0 // Giả sử không có thông tin comment
    };
  }

  // Hàm định dạng ngày tháng đơn giản
  private formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return 'Today';
    } else if (diffDays <= 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays}d ago`;
    } else {
      // Format: 'Sep 22, 2024'
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  }
}