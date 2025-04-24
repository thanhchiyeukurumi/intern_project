import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzMessageService } from 'ng-zorro-antd/message';

interface Comment {
  id: string;
  author: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  date: string;
  postTitle: string;
  status: 'approved' | 'pending' | 'spam';
  response?: string;
}

@Component({
  selector: 'app-blogger-comments',
  templateUrl: './blogger-comments.component.html',
  styleUrls: ['./blogger-comments.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzPopconfirmModule,
    NzAvatarModule,
    NzInputModule,
    NzBadgeModule
  ]
})
export class BloggerCommentsComponent {
  searchText = '';
  
  // Mock data for comments
  comments: Comment[] = [
    {
      id: 'comment1',
      author: 'John Smith',
      authorEmail: 'john.smith@example.com',
      authorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      content: 'Great article! I learned a lot from this post and will definitely be using these tips in my own work.',
      date: 'June 15, 2023 at 9:45 AM',
      postTitle: '10 Tips for Better Blog Writing',
      status: 'approved'
    },
    {
      id: 'comment2',
      author: 'Sarah Johnson',
      authorEmail: 'sarah.j@example.com',
      authorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      content: 'I can relate to your journey. The learning curve in development is indeed steep but rewarding.',
      date: 'June 14, 2023 at 6:32 PM',
      postTitle: 'My Journey as a Developer',
      status: 'pending'
    },
    {
      id: 'comment3',
      author: 'Michael Brown',
      authorEmail: 'mbrown@example.com',
      authorAvatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      content: 'This is exactly what I was looking for! Would love to see more content about back-end development too.',
      date: 'June 12, 2023 at 11:20 AM',
      postTitle: 'How I Built My First Web App',
      status: 'approved',
      response: 'Thanks for your feedback! I\'ll definitely cover back-end development in future posts.'
    }
  ];

  constructor(private message: NzMessageService) {}

  approveComment(id: string): void {
    const comment = this.comments.find(c => c.id === id);
    if (comment) {
      comment.status = 'approved';
      this.message.success('Comment approved successfully');
    }
  }

  markAsSpam(id: string): void {
    const comment = this.comments.find(c => c.id === id);
    if (comment) {
      comment.status = 'spam';
      this.message.success('Comment marked as spam');
    }
  }

  deleteComment(id: string): void {
    this.comments = this.comments.filter(comment => comment.id !== id);
    this.message.success('Comment deleted successfully');
  }

  saveResponse(comment: Comment, response: string): void {
    comment.response = response;
    this.message.success('Response saved successfully');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'spam':
        return 'error';
      default:
        return 'default';
    }
  }
}