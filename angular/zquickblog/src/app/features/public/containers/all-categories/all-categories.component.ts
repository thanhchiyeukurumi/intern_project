import { Component, OnInit } from '@angular/core';
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
    NzTagModule,
    NzDividerModule
  ],
  templateUrl: './all-categories.component.html',
  styleUrls: ['./all-categories.component.css']
})
export class AllCategoriesComponent implements OnInit {

  searchText = '';
  popularTopicPills: TopicPill[] = [
    { name: 'Programming', slug: 'programming' },
    { name: 'Data Science', slug: 'data-science' },
    { name: 'Technology', slug: 'technology' },
    { name: 'Self Improvement', slug: 'self-improvement' },
    { name: 'Writing', slug: 'writing' }
  ];

  featuredTopics: FeaturedTopic[] = [
    {
      id: 1, title: 'Programming', iconClass: 'fas fa-code', iconBgColor: 'bg-green-100', iconColor: 'text-green-600',
      description: 'Everything about coding, software development, and programming languages.', exploreLink: '/category/programming', exploreLinkColor: 'text-green-600',
      popularArticles: [
        { title: '10 Python Tips for Advanced Developers', url: '/post/py-tips' },
        { title: 'Building Scalable Web Applications', url: '/post/scalable-web' },
        { title: 'Modern JavaScript Fundamentals', url: '/post/js-fundamentals' }
      ]
    },
    {
      id: 2, title: 'Data Science', iconClass: 'fas fa-chart-line', iconBgColor: 'bg-blue-100', iconColor: 'text-blue-600',
      description: 'Analytics, big data, machine learning, and artificial intelligence.', exploreLink: '/category/data-science', exploreLinkColor: 'text-blue-600',
      popularArticles: [
        { title: 'Introduction to Neural Networks', url: '/post/intro-nn' },
        { title: 'Data Visualization Best Practices', url: '/post/data-viz' },
        { title: 'Ethical Considerations in AI', url: '/post/ai-ethics' }
      ]
    },
     {
      id: 3, title: 'Psychology', iconClass: 'fas fa-brain', iconBgColor: 'bg-purple-100', iconColor: 'text-purple-600',
      description: 'Mental health, behavioral science, and human relationships.', exploreLink: '/category/psychology', exploreLinkColor: 'text-purple-600',
      popularArticles: [
        { title: 'Understanding Cognitive Biases', url: '/post/cognitive-biases' },
        { title: 'The Science of Happiness', url: '/post/happiness-science' },
        { title: 'Managing Stress in Modern Life', url: '/post/stress-management' }
      ]
    },
     {
      id: 4, title: 'Creativity', iconClass: 'fas fa-lightbulb', iconBgColor: 'bg-yellow-100', iconColor: 'text-yellow-600',
      description: 'Art, design, writing, and creative process insights.', exploreLink: '/category/creativity', exploreLinkColor: 'text-yellow-600',
      popularArticles: [
        { title: 'Overcoming Creative Blocks', url: '/post/creative-blocks' },
        { title: 'Designing for Accessibility', url: '/post/accessibility-design' },
        { title: 'The Art of Storytelling', url: '/post/storytelling-art' }
      ]
    },
     {
      id: 5, title: 'Health', iconClass: 'fas fa-heartbeat', iconBgColor: 'bg-red-100', iconColor: 'text-red-600',
      description: 'Wellness, nutrition, fitness, and medical knowledge.', exploreLink: '/category/health', exploreLinkColor: 'text-red-600',
      popularArticles: [
        { title: 'The Science of Sleep', url: '/post/sleep-science' },
        { title: 'Nutrition Myths Debunked', url: '/post/nutrition-myths' },
        { title: 'Exercise for Mental Health', url: '/post/exercise-mental-health' }
      ]
    },
     {
      id: 6, title: 'Politics', iconClass: 'fas fa-landmark', iconBgColor: 'bg-indigo-100', iconColor: 'text-indigo-600',
      description: 'Current events, policy discussions, and political analysis.', exploreLink: '/category/politics', exploreLinkColor: 'text-indigo-600',
      popularArticles: [
        { title: 'Understanding Electoral Systems', url: '/post/electoral-systems' },
        { title: 'Global Political Trends', url: '/post/global-trends' },
        { title: 'Media Literacy in Political News', url: '/post/media-literacy' }
      ]
    }
  ];

   recommendedPublications: Publication[] = [
      { id: 1, imageUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', title: 'The Startup', description: 'Medium\'s largest active publication, followed by +738K people.', followLink: '#' },
      { id: 2, imageUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', title: 'Better Programming', description: 'Advice for programmers and developers looking to level up their skills.', followLink: '#' },
      { id: 3, imageUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', title: 'Towards Data Science', description: 'Share concepts, ideas, and codes related to data science.', followLink: '#' },
      { id: 4, imageUrl: 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256', title: 'The Writing Cooperative', description: 'Helping each other write better through community and feedback.', followLink: '#' }
  ];


  constructor() { }

  ngOnInit(): void {
    // Load data if needed
  }

  searchTopics(): void {
    console.log('Searching for topics:', this.searchText);
    // Implement search logic here
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