import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // **** Thêm DatePipe ****
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; // **** Thêm Router ****
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
import { NzPaginationModule } from 'ng-zorro-antd/pagination'; // **** Thêm NzPaginationModule ****

// **** Định nghĩa lại Interfaces cục bộ cho khớp Mock Data ****
interface PostLanguageVariant {
  id: number;
  title: string;
  status: 'published' | 'draft' | 'pending';
  language: string;
  languageCode: string;
  publishedAt: string | null;
  views: number;
  comments: number; // Giữ lại nếu mock data có
}

interface Post {
  id: number;
  title: string;
  status: 'published' | 'draft' | 'pending';
  publishedAt: string | null;
  author: string; // Mock data dùng author string
  category: string[]; // Mock data dùng mảng string
  views: number;
  comments: number; // Giữ lại nếu mock data có
  expand: boolean; // Giữ lại để quản lý expand
  languageVariants?: PostLanguageVariant[]; // Mock data dùng tên này
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
    DatePipe, // **** Thêm DatePipe ****
    NzPaginationModule // **** Thêm NzPaginationModule ****
  ],
  providers: [
      DatePipe // **** Cung cấp DatePipe ****
  ]
})
export class BloggerPostsComponent implements OnInit {
  searchText = '';
  filterStatus = 'all';
  loading = false;

  // Định nghĩa cột (cần khớp với cấu trúc hiển thị)
  listOfColumns = [
    { title: 'Title' }, // Bỏ compare nếu không cần sort client-side nữa
    { title: 'Status' },
    { title: 'Published' },
    { title: 'Language' }, // Thêm cột ngôn ngữ
    { title: 'Category' },
    { title: 'Views' },
    // { title: 'Comments' }, // Bỏ cột Comments
    { title: 'Actions' }
  ];

  languageOptions = [
    { code: 'en', name: 'English' }, { code: 'vi', name: 'Vietnamese' },
    { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' }, { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' }
  ];

  posts: Post[] = []; // Dữ liệu gốc (từ mock data)
  displayPosts: Post[] = []; // Dữ liệu hiển thị sau khi filter và phân trang

  // **** Thêm lại thuộc tính phân trang ****
  pageIndex = 1;
  pageSize = 10; // Số lượng item mỗi trang
  total = 0;

  constructor(
    private message: NzMessageService,
    private modalService: NzModalService,
    // private postService: PostService, // <-- Xóa PostService
    private datePipe: DatePipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMockData(); // Gọi hàm load mock data
  }

  // **** Hàm load mock data ****
  loadMockData(): void {
      this.loading = true;
      // Giả lập độ trễ
      setTimeout(() => {
         this.posts = [ // <-- Gán dữ liệu mẫu vào đây
            {
              id: 1, title: 'Getting Started with Angular', status: 'published', publishedAt: 'Apr 15, 2025',
              author: 'Hoang Thanh', category: ['Angular', 'Web Development'], views: 1256, comments: 24, expand: false,
              languageVariants: [
                { id: 101, title: 'Bắt đầu với Angular', status: 'published', language: 'Vietnamese', languageCode: 'vi', publishedAt: 'Apr 16, 2025', views: 450, comments: 8 },
                { id: 102, title: 'Commencer avec Angular', status: 'draft', language: 'French', languageCode: 'fr', publishedAt: null, views: 0, comments: 0 }
              ]
            },
            {
              id: 2, title: 'Understanding RxJS Operators', status: 'published', publishedAt: 'Apr 10, 2025',
              author: 'Hoang Thanh', category: ['RxJS', 'JavaScript'], views: 843, comments: 15, expand: false,
              languageVariants: [ { id: 201, title: 'Hiểu về các toán tử RxJS', status: 'published', language: 'Vietnamese', languageCode: 'vi', publishedAt: 'Apr 11, 2025', views: 320, comments: 5 } ]
            },
             { id: 3, title: 'Advanced TypeScript Features', status: 'draft', publishedAt: null, author: 'Hoang Thanh', category: ['TypeScript', 'Programming'], views: 0, comments: 0, expand: false, languageVariants: [] },
             { id: 4, title: 'Angular Performance Optimization Tips', status: 'pending', publishedAt: null, author: 'Hoang Thanh', category: ['Angular', 'Performance'], views: 0, comments: 0, expand: false, languageVariants: [] },
             {
              id: 5, title: 'Building Responsive Layouts with CSS Grid', status: 'published', publishedAt: 'Mar 28, 2025',
              author: 'Hoang Thanh', category: ['CSS', 'Web Development'], views: 975, comments: 12, expand: false,
              languageVariants: [
                { id: 501, title: 'Xây dựng bố cục thích ứng với CSS Grid', status: 'published', language: 'Vietnamese', languageCode: 'vi', publishedAt: 'Mar 29, 2025', views: 240, comments: 4 },
                { id: 502, title: 'CSS Gridでレスポンシブレイアウトを構築する', status: 'published', language: 'Japanese', languageCode: 'ja', publishedAt: 'Mar 30, 2025', views: 185, comments: 3 }
              ]
            },
             // Thêm dữ liệu để test phân trang
            { id: 6, title: 'Another Angular Post', status: 'published', publishedAt: 'May 01, 2025', author: 'Jane Doe', category: ['Angular'], views: 500, comments: 5, expand: false, languageVariants: [] },
            { id: 7, title: 'CSS Tricks You Should Know', status: 'draft', publishedAt: null, author: 'Hoang Thanh', category: ['CSS'], views: 0, comments: 0, expand: false, languageVariants: [] },
            { id: 8, title: 'Introduction to Unit Testing', status: 'published', publishedAt: 'May 10, 2025', author: 'John Smith', category: ['Testing', 'JavaScript'], views: 720, comments: 10, expand: false, languageVariants: [] },
            { id: 9, title: 'E-commerce Website Design', status: 'pending', publishedAt: null, author: 'Jane Doe', category: ['Design', 'Web Development'], views: 0, comments: 0, expand: false, languageVariants: [] },
            { id: 10, title: 'State Management Solutions', status: 'published', publishedAt: 'May 15, 2025', author: 'Hoang Thanh', category: ['Angular', 'React'], views: 650, comments: 18, expand: false, languageVariants: [] },
            { id: 11, title: 'Final Post for Pagination', status: 'published', publishedAt: 'May 20, 2025', author: 'Test User', category: ['Testing'], views: 100, comments: 1, expand: false, languageVariants: [] },
         ];
         // Khởi tạo expand
         this.posts.forEach(post => post.expand = false);
         this.filterAndPaginatePosts(); // Gọi hàm filter và phân trang
         this.loading = false;
      }, 500); // Giả lập delay 0.5s
  }

  // **** Hàm kết hợp filter và phân trang client-side ****
  filterAndPaginatePosts(): void {
    let filtered = [...this.posts]; // Bắt đầu với toàn bộ dữ liệu gốc

    // Filter by status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(post => post.status === this.filterStatus);
    }

    // Filter by search text
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        (post.author || '').toLowerCase().includes(searchLower) || // Tìm theo author string
        (post.category || []).some(cat => cat.toLowerCase().includes(searchLower)) // Tìm theo category array
      );
    }

    // Cập nhật tổng số sau khi lọc
    this.total = filtered.length;

    // Phân trang dữ liệu đã lọc
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayPosts = filtered.slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.pageIndex = 1; // Reset về trang 1 khi search
    this.filterAndPaginatePosts();
  }

  onStatusFilterChange(): void {
    this.pageIndex = 1; // Reset về trang 1 khi filter
    this.filterAndPaginatePosts();
  }

  // **** Thêm hàm xử lý sự kiện phân trang ****
  onPageIndexChange(index: number): void {
      this.pageIndex = index;
      this.filterAndPaginatePosts(); // Chỉ cần tính toán lại displayData
  }

  onPageSizeChange(size: number): void {
      this.pageSize = size;
      this.pageIndex = 1; // Reset về trang 1
      this.filterAndPaginatePosts(); // Tính toán lại displayData
  }
  // **** Kết thúc hàm xử lý phân trang ****


  deletePost(id: number): void {
    this.modalService.confirm({
      nzTitle: 'Delete Post',
      nzContent: 'Are you sure you want to delete this post and all its translations?',
      nzOkText: 'Yes', nzOkType: 'primary', nzOkDanger: true, nzCancelText: 'No',
      nzOnOk: () => {
        // **** Xóa trực tiếp trên mảng posts ****
        this.posts = this.posts.filter(post => post.id !== id);
        this.filterAndPaginatePosts(); // Cập nhật lại displayPosts và total
        this.message.success('Post deleted successfully');
      }
    });
  }

  publishPost(id: number): void {
    const postIndex = this.posts.findIndex(p => p.id === id);
    if (postIndex > -1 && this.posts[postIndex].status !== 'published') {
      // **** Cập nhật trực tiếp trên mảng posts ****
      this.posts[postIndex].status = 'published';
      this.posts[postIndex].publishedAt = this.datePipe.transform(new Date(), 'MMM d, y'); // Format date
      this.filterAndPaginatePosts(); // Cập nhật lại displayPosts
      this.message.success('Post published successfully');
    }
  }

  // Hàm getStatusColor giữ nguyên
  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'pending': return 'processing';
      default: return 'default';
    }
  }

  // Methods for handling language variants (translations)
  deleteLanguageVariant(originalPostId: number, translationId: number): void {
     this.modalService.confirm({
      nzTitle: 'Delete Translation',
      nzContent: 'Are you sure you want to delete this translation?',
      nzOkText: 'Yes', nzOkType: 'primary', nzOkDanger: true, nzCancelText: 'No',
      nzOnOk: () => {
        // **** Xóa trực tiếp trên mảng posts ****
        const post = this.posts.find(p => p.id === originalPostId);
        if (post && post.languageVariants) {
            post.languageVariants = post.languageVariants.filter(t => t.id !== translationId);
            this.filterAndPaginatePosts(); // Cập nhật lại displayPosts
        }
        this.message.success('Translation deleted successfully');
      }
    });
  }

  publishLanguageVariant(originalPostId: number, translationId: number): void {
    const post = this.posts.find(p => p.id === originalPostId);
    const variant = post?.languageVariants?.find(t => t.id === translationId);

    if (variant && variant.status !== 'published') {
       // **** Cập nhật trực tiếp trên mảng posts ****
       variant.status = 'published';
       variant.publishedAt = this.datePipe.transform(new Date(), 'MMM d, y');
       this.filterAndPaginatePosts(); // Cập nhật lại displayPosts
       this.message.success('Translation published successfully');
    }
  }

   addLanguageVariant(originalPostId: number): void {
      const post = this.posts.find(p => p.id === originalPostId);
      if (!post) return;

      const existingLanguages = new Set<string | undefined>();
      // Cần thêm ngôn ngữ của bài gốc vào Set nếu có
      // Giả sử bạn có thông tin ngôn ngữ bài gốc trong post.languageCode
      // existingLanguages.add(post.languageCode);
      post.languageVariants?.forEach(t => existingLanguages.add(t.languageCode));

      const availableLanguages = this.languageOptions.filter(lang => !existingLanguages.has(lang.code));

      if (availableLanguages.length === 0) {
          this.message.warning('All available languages already have variants for this post');
          return;
      }

      // ---- Logic hiển thị modal để chọn ngôn ngữ ----
      let selectedLangCode = '';
      const modalRef = this.modalService.create<{ selectedLangCode: string }, string>({ // Định kiểu dữ liệu cho modal
          nzTitle: 'Add New Translation',
          nzContent: `
              <div>
                  <p>Select a language for the new translation:</p>
                  <nz-select [(ngModel)]="selectedLangCode" style="width: 100%;">
                      <nz-option *ngFor="let lang of availableLanguages" [nzValue]="lang.code" [nzLabel]="lang.name"></nz-option>
                  </nz-select>
              </div>
          `,
          // Cần truyền availableLanguages vào component nếu dùng component tùy chỉnh
          nzOnOk: () => {
              if (selectedLangCode) {
                  const selectedLang = this.languageOptions.find(l => l.code === selectedLangCode);
                  console.log(`Simulating adding translation for: ${selectedLang?.name}`);
                  // **** Thêm variant mới vào mock data ****
                   if (post.languageVariants) {
                       const newVariantId = Math.max(0, ...this.posts.flatMap(p => p.languageVariants?.map(v => v.id) || [0])) + 1;
                       post.languageVariants.push({
                         id: newVariantId,
                         title: `${post.title} (${selectedLang?.name})`,
                         status: 'draft',
                         language: selectedLang?.name || 'Unknown',
                         languageCode: selectedLang?.code || 'unknown',
                         publishedAt: null,
                         views: 0,
                         comments: 0
                       });
                       post.expand = true; // Mở rộng để thấy variant mới
                       this.filterAndPaginatePosts(); // Cập nhật displayData
                       this.message.success(`Language variant for ${selectedLang?.name} added (simulation)`);
                   }
                  // **** Có thể điều hướng hoặc không tùy logic ****
                  // this.router.navigate(['/blogger/posts/create'], { queryParams: { originalPostId: originalPostId, langCode: selectedLangCode } });
              } else {
                  this.message.error('Please select a language.');
                  return false; // Ngăn modal đóng
              }
              return true; // Cho phép đóng modal
          }
      });

      // Xử lý việc lấy giá trị từ nz-select trong modal
      // Do modal không phải là một phần của Angular form, ta cần lấy giá trị trực tiếp
      // hoặc tạo một component riêng cho nội dung modal.
      // Cách đơn giản là truy cập DOM (không khuyến khích) hoặc dùng biến tạm như trên.
      // Để lấy giá trị từ ngModel trong modal:
      modalRef.afterOpen.subscribe(() => {
         // Tìm cách bind giá trị select vào biến selectedLangCode
         // Có thể cần dùng ViewChild nếu nội dung modal là component riêng
         // Hoặc dùng [(ngModel)] như trên nếu modalService hỗ trợ two-way binding cho content string (ít khả năng)
         // -> Cách điều hướng sau khi chọn có lẽ đơn giản hơn.
      });

   }


   // Helper để lấy avatar
   getAuthorAvatar(avatarUrl: string | null | undefined): string {
       return avatarUrl || 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'; // Placeholder
   }

    // **** Hàm lấy thông tin phân trang ****
    getPaginationInfo(): string {
      if (this.total === 0) return 'Showing 0 posts';
      const startIndex = (this.pageIndex - 1) * this.pageSize + 1;
      const endIndex = Math.min(startIndex + this.pageSize - 1, this.total);
      const displayStartIndex = Math.min(startIndex, this.total);
      return `Showing <strong>${displayStartIndex}</strong> to <strong>${endIndex}</strong> of <strong>${this.total}</strong> posts`;
    }
}