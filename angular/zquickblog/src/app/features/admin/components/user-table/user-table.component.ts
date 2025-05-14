import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzAvatarModule,
    NzEmptyModule
  ],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css']
})
export class UserTableComponent {
  @Input() displayData: User[] = [];
  @Input() loading = false;
  @Input() checked = false;
  @Input() indeterminate = false;
  @Input() setOfCheckedId = new Set<number>();

  @Output() itemChecked = new EventEmitter<{id: number, checked: boolean}>();
  @Output() allChecked = new EventEmitter<boolean>();
  @Output() editUser = new EventEmitter<User>();
  @Output() deleteUser = new EventEmitter<User>();

  onItemChecked(id: number, checked: boolean): void {
    this.itemChecked.emit({id, checked});
  }

  onAllChecked(checked: boolean): void {
    this.allChecked.emit(checked);
  }

  showEditForm(user: User): void {
    this.editUser.emit(user);
  }

  confirmDeleteUser(user: User): void {
    this.deleteUser.emit(user);
  }

  // Hàm hỗ trợ hiển thị
  getRoleColor(roleName: string | undefined): string {
    switch (roleName) {
      case 'admin': return 'red';
      case 'blogger': return 'blue';
      case 'user': return 'green';
      default: return 'default';
    }
  }

  getAuthorAvatar(avatarUrl: string | null | undefined): string {
    return avatarUrl || 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png';
  }
} 