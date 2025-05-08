import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule cho [(ngModel)]
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider'; // Có thể cần cho các đường kẻ
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { finalize } from 'rxjs/operators';

// Thêm CategoryService và Category model
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../shared/models/category.model';
import { PostService } from '../../../../core/services/post.service';

// Interfaces (tùy chọn)
interface TopicPill {
  name: string;
  slug: string;
}

interface TopicArticle {
  title: string;
  url: string;
}

interface FeaturedTopic {
  id: number;
  title: string;
  iconClass: string; // Lớp Font Awesome (ví dụ: 'fas fa-code')
  iconBgColor: string; // Màu nền icon (ví dụ: 'bg-green-100') - Cần chuyển sang CSS class/style
  iconColor: string; // Màu icon (ví dụ: 'text-green-600') - Cần chuyển sang CSS class/style
  description: string;
  exploreLink: string;
  exploreLinkColor: string; // Màu link explore (ví dụ: 'text-green-600') - Cần chuyển sang CSS class/style
  popularArticles: TopicArticle[];
}

interface Publication {
    id: number;
    imageUrl: string;
    title: string;
    description: string;
    followLink: string;
}

// Các icon và màu sắc cho các chủ đề
const TOPIC_STYLES = [
  { iconClass: 'fas fa-code', iconBgColor: 'bg-green-100', iconColor: 'text-green-600', exploreLinkColor: 'text-green-600' },
  { iconClass: 'fas fa-chart-line', iconBgColor: 'bg-blue-100', iconColor: 'text-blue-600', exploreLinkColor: 'text-blue-600' },
  { iconClass: 'fas fa-brain', iconBgColor: 'bg-purple-100', iconColor: 'text-purple-600', exploreLinkColor: 'text-purple-600' },
  { iconClass: 'fas fa-lightbulb', iconBgColor: 'bg-yellow-100', iconColor: 'text-yellow-600', exploreLinkColor: 'text-yellow-600' },
  { iconClass: 'fas fa-heartbeat', iconBgColor: 'bg-red-100', iconColor: 'text-red-600', exploreLinkColor: 'text-red-600' },
  { iconClass: 'fas fa-landmark', iconBgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', exploreLinkColor: 'text-indigo-600' }
];

@Component({
  selector: 'app-all-categories', // Đổi selector nếu cần
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, // Thêm FormsModule
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    NzGridModule,
    NzCardModule,
    NzTypographyModule,
    NzSpinModule,
    NzTagModule,
    NzDividerModule,
    NzMessageModule
  ],
  templateUrl: './all-categories.component.html',
  styleUrls: ['./all-categories.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AllCategoriesComponent implements OnInit {

  searchText = '';
  popularTopicPills: TopicPill[] = [];
  featuredTopics: FeaturedTopic[] = [];
  recommendedPublications: Publication[] = [
    { id: 1, imageUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', title: 'The Startup', description: 'Medium\'s largest active publication, followed by +738K people.', followLink: '#' },
    { id: 2, imageUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', title: 'Better Programming', description: 'Advice for programmers and developers looking to level up their skills.', followLink: '#' },
    { id: 3, imageUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', title: 'Towards Data Science', description: 'Share concepts, ideas, and codes related to data science.', followLink: '#' },
    { id: 4, imageUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', title: 'The Writing Cooperative', description: 'Helping each other write better through community and feedback.', followLink: '#' }
  ];

  isLoading = false;
  isLoadingMore = false;
  currentPage = 1;
  totalPages = 1;
  categoriesPerPage = 9999;
  hasMoreCategories = false;
  allCategories: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    private postService: PostService,
    private messageService: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  // Tải danh sách danh mục từ API
  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAll({
      orderBy: 'name',
      order: 'ASC',
      limit: this.categoriesPerPage, // Thêm limit
      page: this.currentPage // Thêm page để hỗ trợ phân trang
    })
    .pipe(
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: (response) => {
        if (response.data && response.data.length) {
          // Lưu tất cả danh mục
          this.allCategories = response.data;
          
          // Lấy danh mục cho thanh pills
          this.createPopularTopicPills(response.data);
          
          // Tính toán tổng số trang
          this.totalPages = Math.ceil(response.data.length / this.categoriesPerPage);
          this.hasMoreCategories = this.currentPage < this.totalPages;
          
          // Lấy danh mục cho featured topics (chỉ trang đầu tiên)
          this.createFeaturedTopics(response.data.slice(0, this.categoriesPerPage));
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải danh mục:', error);
        this.messageService.error('Không thể tải danh mục. Vui lòng thử lại sau.');
      }
    });
  }

  // Tải thêm danh mục khi bấm nút "Khám phá thêm chủ đề"
  loadMoreCategories(): void {
    if (this.isLoadingMore || !this.hasMoreCategories) return;
    
    this.isLoadingMore = true;
    this.currentPage++;
    
    // Tính vị trí bắt đầu và kết thúc cho trang tiếp theo
    const startIndex = (this.currentPage - 1) * this.categoriesPerPage;
    const endIndex = Math.min(startIndex + this.categoriesPerPage, this.allCategories.length);
    
    // Lấy danh mục cho trang tiếp theo
    const nextPageCategories = this.allCategories.slice(startIndex, endIndex);
    
    // Tạo và thêm vào danh sách featured topics hiện tại
    const newTopics = nextPageCategories.map((category, index) => {
      const styleIndex = (startIndex + index) % TOPIC_STYLES.length;
      const style = TOPIC_STYLES[styleIndex];
      
      return {
        id: category.id,
        title: category.name,
        iconClass: style.iconClass,
        iconBgColor: style.iconBgColor,
        iconColor: style.iconColor,
        description: category.description || `Nội dung về chủ đề ${category.name}.`,
        exploreLink: `/categories/${category.id}`,
        exploreLinkColor: style.exploreLinkColor,
        popularArticles: [] // Sẽ được cập nhật bởi hàm loadArticlesForCategory
      };
    });
    
    // Thêm vào danh sách hiện tại
    this.featuredTopics = [...this.featuredTopics, ...newTopics];
    
    // Cập nhật biến hasMoreCategories
    this.hasMoreCategories = this.currentPage < this.totalPages;
    
    // Tải bài viết cho các danh mục mới
    const loadArticlesPromises = newTopics.map(topic => this.loadArticlesForCategory(topic));
    
    // Sau khi tải tất cả các bài viết, cập nhật trạng thái loading
    Promise.all(loadArticlesPromises).finally(() => {
      this.isLoadingMore = false;
    });
  }

  // Tạo danh sách topic pills từ dữ liệu thực
  createPopularTopicPills(categories: Category[]): void {
    // Chỉ lấy 5 danh mục đầu tiên cho popular topics
    this.popularTopicPills = categories.slice(0, 5).map(category => ({
      name: category.name,
      slug: category.slug || ''
    }));
  }

  // Tạo danh sách Featured Topics từ dữ liệu thực
  createFeaturedTopics(categories: Category[]): void {
    // Xử lý từng danh mục để tạo featured topics
    this.featuredTopics = categories.map((category, index) => {
      // Lấy style từ mảng TOPIC_STYLES theo index
      const style = TOPIC_STYLES[index % TOPIC_STYLES.length];
      
      return {
        id: category.id,
        title: category.name,
        iconClass: style.iconClass,
        iconBgColor: style.iconBgColor,
        iconColor: style.iconColor,
        description: category.description || `Nội dung về chủ đề ${category.name}.`,
        exploreLink: `/categories/${category.id}`,
        exploreLinkColor: style.exploreLinkColor,
        popularArticles: [] // Sẽ được cập nhật bởi hàm loadArticlesForCategory
      };
    });

    // Tải bài viết phổ biến cho mỗi danh mục
    this.featuredTopics.forEach(topic => {
      this.loadArticlesForCategory(topic);
    });
  }

  // Tải bài viết phổ biến cho mỗi danh mục
  loadArticlesForCategory(topic: FeaturedTopic): Promise<void> {
    return new Promise<void>((resolve) => {
      this.postService.getByCategory(topic.id, {
        limit: 3,
        orderBy: 'views',
        order: 'DESC'
      }).subscribe({
        next: (response) => {
          if (response.data && response.data.length) {
            // Cập nhật bài viết phổ biến cho danh mục
            topic.popularArticles = response.data.slice(0, 3).map(post => ({
              title: post.title,
              url: `/post/${post.slug || post.id}`
            }));
          } else {
            // Nếu không có bài viết, hiển thị thông báo mặc định
            topic.popularArticles = [
              { title: 'Chưa có bài viết nào.', url: '#' }
            ];
          }
          resolve();
        },
        error: () => {
          // Nếu có lỗi, hiển thị thông báo mặc định
          topic.popularArticles = [
            { title: 'Chưa có bài viết nào.', url: '#' }
          ];
          resolve();
        }
      });
    });
  }

  searchTopics(): void {
    if (!this.searchText.trim()) {
      return;
    }
    
    this.isLoading = true;
    this.categoryService.getAll({
      search: this.searchText,
      limit: 20
    })
    .pipe(
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: (response) => {
        if (response.data && response.data.length) {
          this.createFeaturedTopics(response.data);
          this.messageService.success(`Tìm thấy ${response.data.length} chủ đề.`);
          this.hasMoreCategories = false; // Không hiển thị nút "Xem thêm" khi tìm kiếm
        } else {
          this.featuredTopics = [];
          this.messageService.info('Không tìm thấy chủ đề nào phù hợp.');
        }
      },
      error: () => {
        this.messageService.error('Đã xảy ra lỗi khi tìm kiếm.');
      }
    });
  }

  // Hàm trợ giúp để lấy class CSS từ tên màu Tailwind
  getIconBgClass(colorName: string): string {
    // Ví dụ: 'bg-green-100' -> 'icon-bg-green'
    return `icon-bg-${colorName.split('-')[1]}`;
  }
  getIconColorClass(colorName: string): string {
    // Ví dụ: 'text-green-600' -> 'icon-color-green'
    return `icon-color-${colorName.split('-')[1]}`;
  }
  getLinkColorClass(colorName: string): string {
    // Ví dụ: 'text-green-600' -> 'link-color-green'
     return `link-color-${colorName.split('-')[1]}`;
  }

}