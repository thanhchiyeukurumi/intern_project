import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid'; // Cho layout grid
import { NzCardModule } from 'ng-zorro-antd/card'; // Cho các post preview
import { NzAvatarModule } from 'ng-zorro-antd/avatar'; // Cho avatar tác giả
import { NzTypographyModule } from 'ng-zorro-antd/typography'; // Cho styling text
import { NzTagModule } from 'ng-zorro-antd/tag'; // Cho recommended topics
import { NzButtonModule } from 'ng-zorro-antd/button'; // Cho nút "Explore More"

// Interface (tùy chọn) để định nghĩa cấu trúc dữ liệu
interface PostPreview {
  id: number;
  title: string;
  authorAvatar: string;
  description: string;
  date: string;
  commentCount: number;
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

  // Dữ liệu mẫu (trong ứng dụng thực tế sẽ lấy từ API)
  posts: PostPreview[] = [
    {
      id: 1,
      title: 'I Wrote On LinkedIn for 100 Days. Now I Never Worry About Finding a Job.',
      authorAvatar: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256',
      description: 'Everyone is hiring.',
      date: 'Sep 22, 2024',
      commentCount: 964
    },
    {
      id: 2,
      title: 'A Unified Machine Learning Framework for Time Series Forecasting',
      authorAvatar: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256',
      description: 'Harness Diverse Algorithms to Improve Predictive Accuracy from Transactional Data',
      date: '1d ago',
      commentCount: 1
    },
    {
      id: 3,
      title: 'System Design For Beginners: Everything You Need in One Article',
      authorAvatar: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256',
      description: 'One shot solution for any System Design Interview.',
      date: 'Dec 21, 2024',
      commentCount: 74
    }
  ];

  randomPosts = [
    { id: 4, title: 'Growing the Twitter Culture', url: '/post/4' },
    { id: 5, title: 'At sea with the Black Knight', url: '/post/5' },
    { id: 6, title: 'Finding My Photo Mojo', url: '/post/6' }
  ];

  recommendedTopics: Topic[] = [
    { name: 'Technology', slug: 'technology' },
    { name: 'Writing', slug: 'writing' },
    { name: 'Relationships', slug: 'relationships' },
    { name: 'Machine Learning', slug: 'machine-learning' },
    { name: 'Productivity', slug: 'productivity' },
    { name: 'Cryptocurrency', slug: 'cryptocurrency' }
  ];

  constructor() { }

  ngOnInit(): void {
    // Logic khởi tạo nếu cần
  }

  loadMorePosts(): void {
    // Logic để tải thêm bài viết (ví dụ: gọi API)
    console.log('Loading more posts...');
    // Thêm dữ liệu mẫu để demo
    this.posts.push({
      id: this.posts.length + 1,
      title: `More Post ${this.posts.length + 1}`,
      authorAvatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      description: 'This is another post loaded dynamically.',
      date: 'Just now',
      commentCount: 0
    });
  }

}