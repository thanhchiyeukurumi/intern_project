import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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

interface Post {
  id: number;
  title: string;
  status: 'published' | 'draft' | 'pending';
  publishedAt: string | null;
  author: string;
  category: string[];
  views: number;
  comments: number;
}

@Component({
  selector: 'app-blogger-posts',
  templateUrl: './blogger-posts.component.html',
  styleUrls: ['./blogger-posts.component.scss'],
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
    NzEmptyModule
  ]
})
export class BloggerPostsComponent implements OnInit {
  searchText = '';
  filterStatus = 'all';
  
  listOfColumns = [
    {
      title: 'Title',
      compare: (a: Post, b: Post) => a.title.localeCompare(b.title)
    },
    {
      title: 'Status',
      compare: (a: Post, b: Post) => a.status.localeCompare(b.status)
    },
    {
      title: 'Published',
      compare: (a: Post, b: Post) => {
        if (a.publishedAt && b.publishedAt) {
          return a.publishedAt.localeCompare(b.publishedAt);
        }
        return a.publishedAt ? 1 : -1;
      }
    },
    {
      title: 'Category',
      compare: null
    },
    {
      title: 'Views',
      compare: (a: Post, b: Post) => a.views - b.views
    },
    {
      title: 'Comments',
      compare: (a: Post, b: Post) => a.comments - b.comments
    },
    {
      title: 'Actions',
      compare: null
    }
  ];
  
  posts: Post[] = [
    {
      id: 1,
      title: 'Getting Started with Angular',
      status: 'published',
      publishedAt: 'Apr 15, 2025',
      author: 'Hoang Thanh',
      category: ['Angular', 'Web Development'],
      views: 1256,
      comments: 24
    },
    {
      id: 2,
      title: 'Understanding RxJS Operators',
      status: 'published',
      publishedAt: 'Apr 10, 2025',
      author: 'Hoang Thanh',
      category: ['RxJS', 'JavaScript'],
      views: 843,
      comments: 15
    },
    {
      id: 3,
      title: 'Advanced TypeScript Features',
      status: 'draft',
      publishedAt: null,
      author: 'Hoang Thanh',
      category: ['TypeScript', 'Programming'],
      views: 0,
      comments: 0
    },
    {
      id: 4,
      title: 'Angular Performance Optimization Tips',
      status: 'pending',
      publishedAt: null,
      author: 'Hoang Thanh',
      category: ['Angular', 'Performance'],
      views: 0,
      comments: 0
    },
    {
      id: 5,
      title: 'Building Responsive Layouts with CSS Grid',
      status: 'published',
      publishedAt: 'Mar 28, 2025',
      author: 'Hoang Thanh',
      category: ['CSS', 'Web Development'],
      views: 975,
      comments: 12
    }
  ];
  
  displayPosts: Post[] = [];
  
  constructor(private message: NzMessageService) {}
  
  ngOnInit(): void {
    this.filterPosts();
  }
  
  filterPosts(): void {
    let filtered = [...this.posts];
    
    // Filter by status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(post => post.status === this.filterStatus);
    }
    
    // Filter by search text
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchLower) || 
        post.author.toLowerCase().includes(searchLower) ||
        post.category.some(cat => cat.toLowerCase().includes(searchLower))
      );
    }
    
    this.displayPosts = filtered;
  }
  
  onSearch(): void {
    this.filterPosts();
  }
  
  onStatusFilterChange(): void {
    this.filterPosts();
  }
  
  deletePost(id: number): void {
    this.posts = this.posts.filter(post => post.id !== id);
    this.filterPosts();
    this.message.success('Post deleted successfully');
  }
  
  publishPost(id: number): void {
    const post = this.posts.find(p => p.id === id);
    if (post) {
      post.status = 'published';
      post.publishedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      this.message.success('Post published successfully');
      this.filterPosts();
    }
  }
  
  getStatusColor(status: string): string {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'pending': return 'processing';
      default: return 'default';
    }
  }
}