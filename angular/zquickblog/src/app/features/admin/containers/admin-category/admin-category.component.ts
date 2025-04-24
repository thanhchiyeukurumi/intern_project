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
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';

interface Category {
  id: number;
  name: string;
  parent?: string;
  count?: number;
}

@Component({
  selector: 'app-admin-category',
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
    NzFormModule,
    NzDropDownModule,
    NzModalModule
  ],
  templateUrl: './admin-category.component.html',
  styleUrl: './admin-category.component.css'
})
export class AdminCategoryComponent implements OnInit {
  isFormVisible = false;
  categoryName = '';
  parentCategory = null;
  listOfData: Category[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();

  ngOnInit(): void {
    this.listOfData = [
      {
        id: 1,
        name: 'Technology',
        count: 24
      },
      {
        id: 2,
        name: 'Web Development',
        parent: 'Technology',
        count: 18
      },
      {
        id: 3,
        name: 'Design',
        count: 15
      },
      {
        id: 4,
        name: 'UI/UX',
        parent: 'Design',
        count: 8
      },
      {
        id: 5,
        name: 'Programming',
        count: 32
      }
    ];
  }

  showForm(): void {
    this.isFormVisible = true;
  }

  hideForm(): void {
    this.isFormVisible = false;
    this.resetForm();
  }

  resetForm(): void {
    this.categoryName = '';
    this.parentCategory = null;
  }

  addCategory(): void {
    if (this.categoryName.trim()) {
      const newId = this.listOfData.length > 0 
        ? Math.max(...this.listOfData.map(cat => cat.id)) + 1 
        : 1;
      
      const newCategory: Category = {
        id: newId,
        name: this.categoryName,
        count: 0
      };
      
      if (this.parentCategory) {
        newCategory.parent = this.parentCategory;
      }
      
      this.listOfData = [...this.listOfData, newCategory];
      this.hideForm();
    }
  }

  deleteCategory(id: number): void {
    this.listOfData = this.listOfData.filter(item => item.id !== id);
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
}