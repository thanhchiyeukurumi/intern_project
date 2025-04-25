import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card'; // Dùng cho sidebar
import { NzDividerModule } from 'ng-zorro-antd/divider'; // Nếu cần
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

// Interfaces (tùy chọn)
interface BlogProfile {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  email?: string; // Email là tùy chọn
}

interface BlogPostPreview {
  id: string; // Hoặc number
  title: string;
  date: string;
  readTime: number;
  excerpt: string;
  tags: string[];
  commentCount: number;
}

interface BlogTopic {
    name: string;
    slug: string;
}

interface RecommendedBlogger {
    id: string;
    name: string;
    description: string;
    avatarUrl: string;
    profileLink: string;
}

@Component({
  selector: 'app-blog-detail', // Đổi selector nếu cần
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzGridModule,
    NzAvatarModule,
    NzTypographyModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzCardModule,
    NzDividerModule
  ],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit {

  profile: BlogProfile | null = null;
  posts: BlogPostPreview[] = [];
  authorTopics: BlogTopic[] = [];
  recommendedTopics: BlogTopic[] = [];
  otherBloggers: RecommendedBlogger[] = [];
  isLoading = true;
  isLoadingMorePosts = false; // State cho nút load more

  constructor(
    private route: ActivatedRoute
    // Inject services để lấy dữ liệu
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const blogId = params.get('id'); // Lấy ID từ route (ví dụ: 'rejserin')
        if (!blogId) {
          console.error('Blog ID not found in route');
          return of(null);
        }
        this.isLoading = true;
        return this.fetchBlogData(blogId); // Giả lập API call
      })
    ).subscribe(data => {
      if (data) {
        this.profile = data.profile;
        this.posts = data.posts;
        this.authorTopics = data.authorTopics;
        this.recommendedTopics = data.recommendedTopics;
        this.otherBloggers = data.otherBloggers;
      }
      this.isLoading = false;
    });
  }

  // Hàm giả lập API
  fetchBlogData(blogId: string) {
    console.log(`Fetching data for blog: ${blogId}`);
    return of({
      profile: {
        id: blogId,
        name: 'Rejserin',
        avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256',
        bio: 'Writer and researcher passionate about technology and its impact on society. Writing about UX, product design, and digital innovation.',
        email: 'rejserin@example.com' // Thêm email nếu có
      },
      posts: [
        { id: 'post1', title: 'The Psychology Behind Effective Call-to-Actions', date: 'Apr 8, 2023', readTime: 5, excerpt: 'Understanding human psychology can dramatically improve conversion rates. Here\'s how to craft CTAs that drive user engagement.', tags: ['Marketing', 'Psychology'], commentCount: 14 },
        { id: 'post2', title: 'Accessibility in Web Design: More Than Just Compliance', date: 'Mar 22, 2023', readTime: 7, excerpt: 'Creating truly inclusive digital experiences requires going beyond minimum standards. Here\'s how to build products everyone can use and enjoy.', tags: ['Accessibility', 'Web Design', 'Inclusion'], commentCount: 47 }
      ],
      authorTopics: [
        { name: 'UX Design', slug: 'ux-design'}, { name: 'Product Development', slug: 'product-development'},
        { name: 'Technology', slug: 'technology'}, { name: 'Accessibility', slug: 'accessibility'},
        { name: 'Digital Strategy', slug: 'digital-strategy'}
      ],
      recommendedTopics: [
        { name: 'Programming', slug: 'programming'}, { name: 'Data Science', slug: 'data-science'},
        { name: 'Machine Learning', slug: 'machine-learning'}, { name: 'UI Design', slug: 'ui-design'},
        { name: 'Productivity', slug: 'productivity'}, { name: 'Self Improvement', slug: 'self-improvement'}
      ],
      otherBloggers: [
         { id: 'blogger1', name: 'David Miller', description: 'UX Researcher, Writer', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', profileLink: '/blog/david-miller'},
         { id: 'blogger2', name: 'Emma Watson', description: 'Product Designer', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', profileLink: '/blog/emma-watson'},
         { id: 'blogger3', name: 'Tech Insights', description: 'Publication', avatarUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', profileLink: '/publication/tech-insights'}
      ]
    }); // .pipe(delay(1000));
  }

   loadMorePosts(): void {
      this.isLoadingMorePosts = true;
      console.log('Loading more posts for this blog...');
      // --- Logic gọi API để lấy thêm bài viết ---
      const morePosts: BlogPostPreview[] = [
           { id: `post${this.posts.length + 1}`, title: `Another Insightful Post ${this.posts.length + 1}`, date: 'Jan 10, 2023', readTime: 6, excerpt: 'Exploring deeper concepts within the author\'s field of expertise.', tags: ['Deep Dive', 'Analysis'], commentCount: 5 },
           { id: `post${this.posts.length + 2}`, title: `Case Study: Project Phoenix ${this.posts.length + 2}`, date: 'Dec 5, 2022', readTime: 9, excerpt: 'A detailed look into a challenging project and the lessons learned.', tags: ['Case Study', 'Project Management'], commentCount: 21 }
      ];
      setTimeout(() => { // Giả lập API delay
           this.posts = [...this.posts, ...morePosts];
           this.isLoadingMorePosts = false;
      }, 1000);
   }

}