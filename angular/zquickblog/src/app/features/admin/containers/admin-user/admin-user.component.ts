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
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

@Component({
  selector: 'app-admin-user',
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
    NzPaginationModule,
    NzDropDownModule
  ],
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.css']
})
export class AdminUserComponent implements OnInit {
  searchValue = '';
  selectedRole = null;
  listOfData: User[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();

  ngOnInit(): void {
    this.listOfData = [
      {
        id: 1,
        name: 'Jane Cooper',
        email: 'jane.cooper@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/42.jpg',
        role: 'Admin'
      },
      {
        id: 2,
        name: 'Michael Smith',
        email: 'michael.smith@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        role: 'Editor'
      },
      {
        id: 3,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/57.jpg',
        role: 'Subscriber'
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

  getRoleColor(role: string): string {
    switch (role) {
      case 'Admin':
        return 'red';
      case 'Editor':
        return 'blue';
      case 'Subscriber':
        return 'green';
      default:
        return 'default';
    }
  }
}
