import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'app-admin-pagination',
  standalone: true,
  imports: [
    CommonModule,
    NzPaginationModule
  ],
  templateUrl: './admin-pagination.component.html',
  styleUrls: ['./admin-pagination.component.css']
})
export class AdminPaginationComponent {
  @Input() total = 0;
  @Input() pageIndex = 1;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50, 100];
  @Input() showTotal = true;

  @Output() pageIndexChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  onPageIndexChange(index: number): void {
    this.pageIndexChange.emit(index);
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }

  /**
   * Trả về thông tin phân trang
   */
  getPaginationInfo(): string {
    if (this.total === 0) return 'Không có kết quả';
    const startIndex = (this.pageIndex - 1) * this.pageSize + 1;
    const endIndex = Math.min(startIndex + this.pageSize - 1, this.total);
    const displayStartIndex = Math.min(startIndex, this.total);
    return `Hiển thị <strong>${displayStartIndex}</strong> đến <strong>${endIndex}</strong> trên tổng số <strong>${this.total}</strong> kết quả`;
  }
} 