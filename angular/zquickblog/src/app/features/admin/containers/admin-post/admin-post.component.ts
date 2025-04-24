import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

interface Post {
  id: number;
  title: string;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  category: string;
  date: string;
}

@Component({
  selector: 'app-admin-post',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzAvatarModule,
    NzTagModule,
    NzPaginationModule
  ],
  templateUrl: './admin-post.component.html',
  styleUrl: './admin-post.component.css'
})
export class AdminPostComponent implements OnInit {
  searchValue = '';
  selectedCategory = null;
  selectedDate = null;
  listOfData: Post[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();
  
  ngOnInit(): void {
    this.listOfData = [
      {
        id: 1,
        title: '10 Tips for Better JavaScript Code',
        author: {
          id: 1,
          name: 'John Admin',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        category: 'Technology',
        date: 'Jul 15, 2023'
      },
      {
        id: 2,
        title: 'Understanding React Hooks for Beginners',
        author: {
          id: 2,
          name: 'Sarah Johnson',
          avatar: 'https://randomuser.me/api/portraits/women/25.jpg'
        },
        category: 'Development',
        date: 'Jun 28, 2023'
      },
      {
        id: 3,
        title: 'The Future of Web Development',
        author: {
          id: 3,
          name: 'Michael Smith',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        category: 'Design',
        date: 'Jun 13, 2023'
      }
    ];
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfData.forEach(item => this.updateCheckedSet(item.id, checked));
    this.refreshCheckedStatus();
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfData.filter(({ id }) => !this.setOfCheckedId.has(id));
    this.checked = listOfEnabledData.length > 0 && listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }
  
  getCategoryColor(category: string): string {
    switch (category) {
      case 'Technology':
        return 'blue';
      case 'Development':
        return 'green';
      case 'Design':
        return 'purple';
      default:
        return 'default';
    }
  }
}
