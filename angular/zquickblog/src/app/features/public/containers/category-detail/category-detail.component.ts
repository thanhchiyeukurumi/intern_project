import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs'; // Để giả lập API call

// Interfaces (Tùy chọn)
interface CategoryDetails {
  id: string;
  name: string;
  description: string;
  storyCount: number;
  // Thêm các trường khác nếu cần
}

interface Author {
  name: string;
  avatarUrl: string;
}

interface PostBase {
    id: string; // Hoặc number
    title: string;
    author: Author;
    excerpt?: string;
    date: string;
    readTime?: number;
    tag?: string; // Tag chính của bài viết
    imageUrl?: string;
}

interface FeaturedPost extends PostBase {}

interface TrendingPost extends PostBase {}

interface LatestPost extends PostBase {}

interface WriterProfile {
    id: string;
    name: string;
    avatarUrl: string;
    bio: string;
    profileLink: string; // Link tới trang profile của writer
}

interface RelatedTopic {
    name: string;
    slug: string;
}

@Component({
  selector: 'app-category-detail', // Đổi selector nếu cần
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzGridModule,
    NzCardModule,
    NzAvatarModule,
    NzTypographyModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule
  ],
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.css']
})
export class CategoryDetailComponent implements OnInit {

  category: CategoryDetails | null = null;
  featuredPost: FeaturedPost | null = null;
  trendingPosts: TrendingPost[] = [];
  latestPosts: LatestPost[] = [];
  writers: WriterProfile[] = [];
  relatedTopics: RelatedTopic[] = [];
  isLoading = true; // Trạng thái loading ban đầu

  constructor(
    private route: ActivatedRoute
    // Inject các service cần thiết để lấy dữ liệu (CategoryService, PostService,...)
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const categoryId = params.get('id');
        if (!categoryId) {
          // Xử lý trường hợp không có ID (ví dụ: redirect, hiển thị lỗi)
          console.error('Category ID not found in route');
          return of(null); // Trả về Observable null
        }
        this.isLoading = true;
        // Gọi API để lấy dữ liệu chi tiết category và các bài viết liên quan
        return this.fetchCategoryData(categoryId); // Giả lập API call
      })
    ).subscribe(data => {
      if (data) {
        this.category = data.details;
        this.featuredPost = data.featured;
        this.trendingPosts = data.trending;
        this.latestPosts = data.latest;
        this.writers = data.writers;
        this.relatedTopics = data.relatedTopics;
      } else {
        // Xử lý lỗi nếu fetch data thất bại
      }
      this.isLoading = false;
    });
  }

  // Hàm giả lập việc lấy dữ liệu từ API
  fetchCategoryData(categoryId: string) {
    console.log(`Fetching data for category: ${categoryId}`);
    // Trong ứng dụng thực tế, đây sẽ là nhiều lệnh gọi API
    return of({
      details: {
        id: categoryId,
        name: 'Society', // Lấy tên thật từ API
        description: 'Exploring the systems, structures, and issues that shape our everyday interactions and collective human experience.',
        storyCount: 12800,
      },
      featured: {
        id: 'feat-1',
        title: 'The Invisible Threads That Connect Modern Society',
        author: { name: 'Emma Johnson', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256' },
        excerpt: 'In an increasingly digital world, we\'re paradoxically more connected and more isolated than ever before. This piece examines the subtle ways our society has transformed and what it means for our collective future.',
        date: 'Jun 12', readTime: 8, tag: 'Society',
        imageUrl: 'https://via.placeholder.com/600x400/cccccc/888888?text=Featured+Image' // Placeholder
      },
      trending: [
        { id: 'trend-1', title: 'The Great Urban Migration: How Cities Are Changing', author: { name: 'Michael Chen', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256' }, excerpt: 'Millions are moving to cities worldwide, transforming urban landscapes and creating new social dynamics.', date: 'May 28', readTime: 6, tag: 'Urban Life' },
        { id: 'trend-2', title: 'Digital Divide: Who\'s Being Left Behind?', author: { name: 'Sophia Williams', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256' }, excerpt: 'As technology advances, the gap widens between those with digital access and those without.', date: 'Jun 2', readTime: 7, tag: 'Technology' },
        { id: 'trend-3', title: 'The Economics of Happiness: Beyond GDP', author: { name: 'James Wilson', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256' }, excerpt: 'Countries are starting to measure well-being alongside traditional economic metrics. What can we learn?', date: 'Jun 8', readTime: 9, tag: 'Economics' }
      ],
      latest: [
         { id: 'latest-1', title: 'The Revival of Community Spaces in Post-Pandemic World', author: { name: 'David Martinez', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256' }, excerpt: 'Public gathering spaces are being reimagined as we navigate new social norms and expectations.', date: 'Jun 14', readTime: 5, tag: 'Urban Planning', imageUrl: 'https://via.placeholder.com/300x200/dddddd/aaaaaa?text=Latest+1' },
         { id: 'latest-2', title: 'Modern Tribalism: How Group Identity Shapes Our Worldview', author: { name: 'Priya Sharma', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256' }, excerpt: 'From sports teams to political parties, our social affiliations profoundly influence how we see the world around us.', date: 'Jun 13', readTime: 11, tag: 'Psychology', imageUrl: 'https://via.placeholder.com/300x200/dddddd/aaaaaa?text=Latest+2' },
         { id: 'latest-3', title: 'The Changing Face of Education: Learning Beyond Classrooms', author: { name: 'Robert Kim', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256' }, excerpt: 'Traditional educational models are being challenged by new approaches that emphasize experiential learning and practical skills.', date: 'Jun 10', readTime: 8, tag: 'Education', imageUrl: 'https://via.placeholder.com/300x200/dddddd/aaaaaa?text=Latest+3' },
         { id: 'latest-4', title: 'Intergenerational Living: Old Solutions for Modern Problems', author: { name: 'Sarah Johnson', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256' }, excerpt: 'As housing costs rise and social isolation increases, multigenerational households are making a comeback with surprising benefits.', date: 'Jun 9', readTime: 6, tag: 'Housing', imageUrl: 'https://via.placeholder.com/300x200/dddddd/aaaaaa?text=Latest+4' },
      ],
       writers: [
         { id: 'writer-1', name: 'Elena Rodriguez', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', bio: 'Social anthropologist and author exploring community dynamics in digital age', profileLink: '/profile/elena-rodriguez' },
         { id: 'writer-2', name: 'Marcus Thompson', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', bio: 'Urban sociologist and policy advisor studying inequality in metropolitan areas', profileLink: '/profile/marcus-thompson' },
         { id: 'writer-3', name: 'Naomi Chen', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', bio: 'Economics researcher focused on social impact of emerging technologies', profileLink: '/profile/naomi-chen' },
         { id: 'writer-4', name: 'Daniel Osei', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', bio: 'Political scientist and commentator on global democratic movements', profileLink: '/profile/daniel-osei' }
       ],
       relatedTopics: [
         { name: 'Politics', slug: 'politics' }, { name: 'Culture', slug: 'culture' },
         { name: 'Economics', slug: 'economics' }, { name: 'Psychology', slug: 'psychology' },
         { name: 'History', slug: 'history' }, { name: 'Urban Studies', slug: 'urban-studies' },
         { name: 'Philosophy', slug: 'philosophy' }, { name: 'Anthropology', slug: 'anthropology' }
       ]
    }).pipe( /* delay(1000) */ ); // Giả lập độ trễ mạng nếu cần
  }

  loadMoreLatestPosts(): void {
      console.log('Loading more latest posts...');
      // Logic gọi API để lấy thêm bài viết và nối vào mảng this.latestPosts
      const morePosts: LatestPost[] = [
           { id: `latest-${this.latestPosts.length + 1}`, title: `Even More Latest Post ${this.latestPosts.length + 1}`, author: { name: 'New Author', avatarUrl: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png' }, excerpt: 'Another description for the loaded post.', date: 'Just now', readTime: 4, tag: 'New Tag', imageUrl: 'https://via.placeholder.com/300x200/cccccc/999999?text=More+Latest' },
           { id: `latest-${this.latestPosts.length + 2}`, title: `The Final Latest Post ${this.latestPosts.length + 2}`, author: { name: 'Another Writer', avatarUrl: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png' }, excerpt: 'This is the final post loaded for this example.', date: 'A moment ago', readTime: 7, tag: 'Final', imageUrl: 'https://via.placeholder.com/300x200/cccccc/999999?text=Final+Post' }
      ];
      this.latestPosts = [...this.latestPosts, ...morePosts];
  }

  // Hàm format số lượng story (ví dụ: 12800 -> 12.8K)
  formatStoryCount(count: number): string {
      if (count >= 1000) {
          return (count / 1000).toFixed(1) + 'K';
      }
      return count.toString();
  }

}