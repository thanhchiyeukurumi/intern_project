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

// Interface cho Role để quản lý danh sách roles
interface Role {
  id: number;
  name: string;
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
    NzEmptyModule,
    NzModalModule // Import ModalModule
  ],
  providers: [
  ],
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.css']
})
export class AdminUserComponent implements OnInit {
  // ============================================ 
  // **Biến trạng thái và thuộc tính**
  // ============================================
  searchValue = '';
  selectedRole: string | null = null;
  displayData: User[] = []; // Đổi tên biến dữ liệu hiển thị thành displayData cho nhất quán
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();

  // Biến cho form thêm/sửa user
  isFormVisible = false;
  formTitle = 'Add New User';
  submitButtonText = 'Add User';
  editMode = false;
  editingUserId: number | null = null;

  // Các trường dữ liệu form
  username = '';
  fullname = '';
  email = '';
  password = '';
  confirmPassword = '';
  selectedRoleId: number | null = null;
  avatar = '';
  description = '';

  // Danh sách roles để hiển thị trong form và filter
  roles: Role[] = [
    { id: 1, name: 'admin' },
    { id: 2, name: 'blogger' },
    { id: 3, name: 'user' }
  ];

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
  // **Form Thêm/Sửa User**
  // ============================================
  showForm(): void {
    this.isFormVisible = true;
    this.editMode = false;
    this.editingUserId = null;
    this.formTitle = 'Add New User';
    this.submitButtonText = 'Add User';
    this.resetForm(); // Reset form khi hiển thị
  }

  // Hàm mới để hiển thị form chỉnh sửa
  showEditForm(user: User): void {
    this.isFormVisible = true;
    this.editMode = true;
    this.editingUserId = user.id;
    this.formTitle = 'Edit User';
    this.submitButtonText = 'Update User';
    
    // Điền thông tin vào form
    this.username = user.username;
    this.fullname = user.fullname || '';
    this.email = user.email;
    this.selectedRoleId = user.role_id;
    this.avatar = user.avatar || '';
    this.description = user.description || '';
    
    // Mật khẩu để trống khi edit
    this.password = '';
    this.confirmPassword = '';
  }

  hideForm(): void {
    this.isFormVisible = false;
    this.resetForm();
    this.editMode = false;
    this.editingUserId = null;
  }

  resetForm(): void {
    this.username = '';
    this.fullname = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.selectedRoleId = null;
    this.avatar = '';
    this.description = '';
  }

  addUser(): void {
    // Kiểm tra các trường bắt buộc
    if (!this.username.trim()) {
      this.message.warning('Vui lòng nhập tên người dùng.');
      return;
    }

    if (!this.email.trim()) {
      this.message.warning('Vui lòng nhập email.');
      return;
    }

    // Kiểm tra mật khẩu khi thêm mới
    if (!this.editMode && !this.password) {
      this.message.warning('Vui lòng nhập mật khẩu.');
      return;
    }

    // Kiểm tra mật khẩu xác nhận
    if (this.password && this.password !== this.confirmPassword) {
      this.message.warning('Mật khẩu xác nhận không khớp.');
      return;
    }

    this.loading = true;

    // Dữ liệu người dùng
    const userData: any = {
      username: this.username.trim(),
      fullname: this.fullname.trim(),
      email: this.email.trim(),
      role_id: this.selectedRoleId
    };

    // Chỉ thêm mật khẩu nếu có
    if (this.password) {
      userData.password = this.password;
    }

    // Thêm avatar nếu có
    if (this.avatar.trim()) {
      userData.avatar = this.avatar.trim();
    }

    // Thêm description nếu có
    if (this.description.trim()) {
      userData.description = this.description.trim();
    }

    if (this.editMode && this.editingUserId) {
      // Cập nhật người dùng
      this.userService.update(this.editingUserId, userData).subscribe({
        next: (updatedUser) => {
          console.log('User updated:', updatedUser);
          this.message.success('Người dùng đã được cập nhật thành công.');
          this.hideForm();
          
          // Cập nhật local state
          const index = this.displayData.findIndex(item => item.id === this.editingUserId);
          if (index !== -1) {
            this.displayData[index] = {...this.displayData[index], ...updatedUser};
          } else {
            this.fetchUsers();
          }
          
          this.loading = false;
        },
        error: (err) => {
          console.error("Error updating user:", err);
          this.loading = false;
          const errorMessage = err?.error?.message || err?.message || 'Không thể cập nhật người dùng.';
          this.message.error(errorMessage);
        }
      });
    } else {
      // Tạo người dùng mới
      this.userService.create(userData).subscribe({
        next: (createdUser) => {
          console.log('User created:', createdUser);
          this.message.success('Người dùng đã được tạo thành công.');
          this.hideForm();
          
          // Cập nhật danh sách
          if (this.pageIndex === 1) {
            if (createdUser) {
              this.displayData = [createdUser, ...this.displayData];
              this.total++;
              this.refreshCheckedStatus();
            }
          } else {
            this.pageIndex = 1;
            this.fetchUsers();
          }
          
          this.loading = false;
        },
        error: (err) => {
          console.error("Error creating user:", err);
          this.loading = false;
          const errorMessage = err?.error?.message || err?.message || 'Không thể tạo người dùng.';
          this.message.error(errorMessage);
        }
      });
    }
  }

  // ============================================
  // **Hàm lấy danh sách người dùng**
  // ============================================
  fetchUsers(): void {
    this.loading = true;
    this.setOfCheckedId.clear(); // Clear selected items khi fetch mới
    this.refreshCheckedStatus();

    const params: any = {
      page: this.pageIndex,
      limit: this.pageSize,
      includeRelations: true,
    };

    // Thêm tham số tìm kiếm nếu có
    if (this.searchValue && this.searchValue.trim() !== '') {
      params.search = this.searchValue.trim();
    }
    
    // Thêm tham số lọc theo role nếu có
    if (this.selectedRole) {
      // Tìm role_id tương ứng với role name
      const selectedRoleObj = this.roles.find(role => role.name === this.selectedRole);
      if (selectedRoleObj) {
        params.role_id = selectedRoleObj.id;
      }
    }

    console.log('API params:', params);

    this.userService.getAll(params).subscribe({
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
    console.log('Filter values:', {
      search: this.searchValue,
      role: this.selectedRole
    });
    
    this.pageIndex = 1; // Reset về trang 1 khi tìm kiếm/lọc mới
    this.fetchUsers(); // Fetch dữ liệu với tham số mới
  }

  // Hàm reset filters
  resetFilters(): void {
    this.searchValue = '';
    this.selectedRole = null;
    this.pageIndex = 1;
    this.fetchUsers();
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

  // Lấy tên role từ roleId
  getRoleName(roleId: number | null | undefined): string {
    if (!roleId) return 'N/A';
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
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
      // Lọc ra user có ID cần xóa
      this.displayData = this.displayData.filter(item => item.id !== userId);
      
      // Tính toán lại số lượng
      this.total = Math.max(0, this.total - 1);
      
      // Chỉ gọi lại nếu trang hiện tại trống
      if (this.displayData.length === 0 && this.pageIndex > 1) {
        this.pageIndex--;
        this.fetchUsers();
      }

      this.setOfCheckedId.delete(userId);
      this.refreshCheckedStatus();
  }
}