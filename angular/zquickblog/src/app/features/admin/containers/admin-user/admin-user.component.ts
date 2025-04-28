import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message'; // Import MessageService
import { UserService } from '../../../../core/services/user.service'; // Đảm bảo đường dẫn đúng
import { User } from '../../../../shared/models/user.model'; // Đảm bảo đường dẫn đúng

// Interface User đã sửa (sử dụng interface đã fix ở trên)
// import { User } from '../../../../shared/models/user.model';

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
    NzEmptyModule,
    NzModalModule // Import ModalModule
  ],
  providers: [
  ],
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.css']
})
export class AdminUserComponent implements OnInit {
  searchValue = '';
  selectedRole: string | null = null;
  displayData: User[] = []; // Đổi tên biến dữ liệu hiển thị thành displayData cho nhất quán
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();

  // Thêm biến phân trang
  pageIndex = 1;
  pageSize = 5; 
  total = 0;
  loading = false;

  constructor(
    private userService: UserService, // Inject UserService
    private message: NzMessageService, // Inject MessageService
    private modalService: NzModalService // Inject ModalService
  ) {}

  ngOnInit(): void {
    this.fetchUsers(); // Gọi hàm fetch dữ liệu
  }

  // ============================================
  // **Hàm lấy danh sách người dùng**
  // ============================================
  fetchUsers(): void {
    this.loading = true;
    this.setOfCheckedId.clear(); // Clear selected items khi fetch mới
    this.refreshCheckedStatus();

    this.userService.getAll({
      page: this.pageIndex,
      limit: this.pageSize,
      search: this.searchValue || undefined,
      includeRelations: true,
    }).subscribe({
      next: (res) => {
        this.displayData = res.data || [];
        this.total = res.pagination?.total || 0;
        this.loading = false;
        this.refreshCheckedStatus(); // Cập nhật trạng thái checkbox
      },
      error: (err) => {
        console.error("Error fetching users:", err);
        this.message.error("Failed to load users. Please try again.");
        this.displayData = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  // ============================================
  // **Xử lý phân trang**
  // ============================================
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.fetchUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1; 
    this.fetchUsers();
  }

  // ============================================
  // **Tìm kiếm và lọc**
  // ============================================
  searchAndFilter(): void {
    this.pageIndex = 1; // Reset về trang 1 khi tìm kiếm/lọc mới
    this.fetchUsers(); // Fetch dữ liệu với tham số mới
  }

  // ============================================
  // **Checkbox**
  // ============================================
  // Giữ nguyên logic checkbox từ AdminPostComponent (đã rất tốt)
  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.displayData.forEach(item => this.updateCheckedSet(item.id, checked));
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
    const listOfEnabledDataOnPage = this.displayData; // Lấy dữ liệu trên trang hiện tại
    this.checked = listOfEnabledDataOnPage.length > 0 && listOfEnabledDataOnPage.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledDataOnPage.length > 0 && listOfEnabledDataOnPage.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  // ============================================
  // **Hàm hỗ trợ hiển thị**
  // ============================================
  // Sử dụng interface User đã sửa, lấy role name từ role object
  getRoleColor(roleName: string | undefined): string {
    switch (roleName) {
      case 'admin': return 'red'; // Sử dụng lowercase nếu backend dùng lowercase
      case 'blogger': return 'blue';
      case 'user': return 'green';
      default: return 'default';
    }
  }

   // Hàm getAuthorAvatar tương tự Post Component (dùng cho avatar user)
   getAuthorAvatar(avatarUrl: string | null | undefined): string {
       return avatarUrl || 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'; // Placeholder
   }

   // Hàm getPaginationInfo tương tự Post Component
   getPaginationInfo(): string {
     if (this.total === 0) return 'Showing 0 users';
     const startIndex = (this.pageIndex - 1) * this.pageSize + 1;
     const endIndex = Math.min(startIndex + this.pageSize - 1, this.total);
     const displayStartIndex = Math.min(startIndex, this.total);
     return `Showing <strong>${displayStartIndex}</strong> to <strong>${endIndex}</strong> of <strong>${this.total}</strong> users`;
   }

  // ============================================
  // **Xác nhận và xóa người dùng**
  // ============================================
  confirmDeleteUser(user: User): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận xóa người dùng',
      nzContent: `Bạn có chắc chắn muốn xóa người dùng <b>"${user.username}"</b> không?`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        console.log('Đã xác nhận xóa người dùng:', user.id);
        // Gọi API Service để xóa người dùng
        return new Promise((resolve, reject) => {
            this.userService.delete(user.id).subscribe({
              next: () => {
                console.log('Xóa thành công qua API');
                this.message.success(`Đã xóa người dùng "${user.username}"`);
                this.deleteUserFromList(user.id); // Xóa khỏi mảng hiển thị local
                resolve(true);
              },
              error: (error) => {
                console.error('Lỗi khi xóa người dùng:', error);
                 const errorMessage = error?.error?.message || error?.message || `Không thể xóa người dùng "${user.username}". Vui lòng thử lại.`;
                 this.message.error(errorMessage);
                reject(false);
              }
            });
        });
      },
      nzOnCancel: () => {
        console.log('Đã hủy xóa');
      }
    });
  }

  deleteUserFromList(userId: number): void {
      this.displayData = this.displayData.filter(item => item.id !== userId);
      this.fetchUsers(); // Fetch lại dữ liệu để cập nhật bảng và paging

      this.setOfCheckedId.delete(userId);
      this.refreshCheckedStatus();
  }
}