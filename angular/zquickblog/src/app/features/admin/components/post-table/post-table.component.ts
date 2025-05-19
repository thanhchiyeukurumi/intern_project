import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { Post } from '../../../../shared/models/post.model';

@Component({
  selector: 'app-post-table',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzAvatarModule,
    NzEmptyModule,
    DatePipe
  ],
  templateUrl: './post-table.component.html',
  styleUrls: ['./post-table.component.css']
})
export class PostTableComponent {
  @Input() displayData: Post[] = [];
  @Input() loading = false;
  @Input() checked = false;
  @Input() indeterminate = false;
  @Input() setOfCheckedId = new Set<number>();

  @Output() editPost = new EventEmitter<Post>();
  @Output() viewPost = new EventEmitter<Post>();
  @Output() deletePost = new EventEmitter<Post>();
  @Output() checkAllChange = new EventEmitter<boolean>();
  @Output() itemCheckedChange = new EventEmitter<{id: number, checked: boolean}>();
  
  /**
   * Lấy màu cho category
   * @param categoryName Tên category
   * @returns Màu sắc
   */
  getCategoryColor(categoryName: string | undefined): string {
    switch (categoryName) {
      case 'Công nghệ': return 'blue';
      case 'Technology': return 'blue';
      case 'Development': return 'green';
      case 'Phần mềm': return 'geekblue';
      case 'Design': return 'purple';
      case 'Trí tuệ nhân tạo': return 'cyan';
      case 'Âm nhạc': return 'red';
      case 'Đại học': return 'gold';
      case 'Giải trí': return 'orange';
      case 'Giáo dục': return 'lime';
      case 'Giáo dục phổ thông': return 'cyan';
      case 'Phần cứng': return 'purple';
      case 'Phim ảnh': return 'orange';
      default: return 'default';
    }
  }

  /**
   * Lấy avatar tác giả
   * @param avatarUrl Đường dẫn avatar
   * @returns Đường dẫn avatar hoặc placeholder
   */
  getAuthorAvatar(avatarUrl: string | null | undefined): string {
    return avatarUrl || 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png';
  }

  onAllChecked(checked: boolean): void {
    this.checkAllChange.emit(checked);
  }

  onItemChecked(id: number, checked: boolean): void {
    this.itemCheckedChange.emit({id, checked});
  }
} 