import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message'; 
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../shared/models/user.model';
import { Role } from '../../../../shared/models/role.model';
import { UserTableComponent } from '../../components/user-table/user-table.component';
import { UserFormComponent } from '../../components/user-form/user-form.component';
import { UserSearchFilterComponent } from '../../components/user-search-filter/user-search-filter.component';
import { AdminPaginationComponent } from '../../components/admin-pagination/admin-pagination.component';

@Component({
  selector: 'app-admin-user',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    UserTableComponent,
    UserFormComponent,
    UserSearchFilterComponent,
    AdminPaginationComponent
  ],
  providers: [],
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.css']
})
export class AdminUserComponent implements OnInit {
  @ViewChild(UserFormComponent) userForm!: UserFormComponent;

  // ============================================
  // **Properties/Biến**
  // ============================================
  // Form properties
  isFormVisible = false;
  editMode = false;
  editingUserId: number | null = null;
  formTitle = 'Thêm người dùng mới';
  submitButtonText = 'Thêm người dùng';
  
  // Table properties
  displayData: User[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();
  
  // Search & Filter properties
  searchValue = '';
  selectedRole: string | null = null;
  
  // Pagination properties
  pageIndex = 1;
  pageSize = 5; 
  total = 0;
  
  // Common properties
  loading = false;
  roles: Role[] = [
    { id: 1, name: 'admin' },
    { id: 2, name: 'blogger' },
    { id: 3, name: 'user' }
  ];

  constructor(
    private userService: UserService,
    private message: NzMessageService,
    private modalService: NzModalService
  ){}

  // ============================================
  // **Lifecycle Hooks**
  // ============================================
  ngOnInit(): void {
    this.fetchUsers();
  }

  // ============================================
  // **Data Fetching - API Calls**
  // ============================================
  /**
   * Lấy danh sách người dùng từ API (có phân trang)
   */
  fetchUsers(): void {
    this.loading = true;
    this.setOfCheckedId.clear();
    this.refreshCheckedStatus();

    const params: any = {
      page: this.pageIndex,
      limit: this.pageSize,
      includeRelations: true,
    };

    if (this.searchValue && this.searchValue.trim() !== '') {
      params.search = this.searchValue.trim();
    }
    
    if (this.selectedRole) {
      const selectedRoleObj = this.roles.find(role => role.name === this.selectedRole);
      if (selectedRoleObj) {
        params.role_id = selectedRoleObj.id;
      }
    }

    this.userService.getAll(params).subscribe({
      next: (res) => {
        this.displayData = res.data || [];
        this.total = res.pagination?.total || 0;
        this.loading = false;
        this.refreshCheckedStatus();
      },
      error: (err) => {
        console.error("Error fetching users:", err);
        this.message.error("Không thể tải danh sách người dùng. Vui lòng thử lại.");
        this.displayData = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  // ============================================
  // **UserForm Component Methods**
  // ============================================
  /**
   * Hiển thị form thêm mới người dùng
   */
  showForm(): void {
    this.isFormVisible = true;
    this.editMode = false;
    this.editingUserId = null;
    this.formTitle = 'Thêm người dùng mới';
    this.submitButtonText = 'Thêm người dùng';
    
    if (this.userForm) {
      this.userForm.resetForm();
    }
  }

  /**
   * Hiển thị form chỉnh sửa người dùng
   */
  showEditForm(user: User): void {
    this.isFormVisible = true;
    this.editMode = true;
    this.editingUserId = user.id;
    this.formTitle = 'Chỉnh sửa người dùng';
    this.submitButtonText = 'Cập nhật người dùng';
    
    if (this.userForm) {
      this.userForm.updateForm(user);
    }
  }

  /**
   * Ẩn form
   */
  hideForm(): void {
    this.isFormVisible = false;
    this.editMode = false;
    this.editingUserId = null;
  }

  /**
   * Xử lý khi form submit
   */
  handleFormSubmit(userData: {
    username: string;
    fullname: string;
    email: string;
    password: string;
    role_id: number | null;
    avatar: string;
    description: string;
  }): void {
    this.loading = true;
    
    // Chuẩn bị dữ liệu để gửi đến API
    const apiData: any = {
      username: userData.username,
      fullname: userData.fullname,
      email: userData.email,
      avatar: userData.avatar,
      description: userData.description
    };
    
    // Chỉ thêm mật khẩu nếu được cung cấp
    if (userData.password) {
      apiData.password = userData.password;
    }
    
    // Xử lý role_id
    if (userData.role_id !== null) {
      apiData.role_id = userData.role_id;
    }
    
    if (this.editMode && this.editingUserId) {
      // Thực hiện cập nhật người dùng
      this.userService.update(this.editingUserId, apiData).subscribe({
        next: (updatedUser) => {
          console.log('User updated:', updatedUser);
          this.message.success('Người dùng đã được cập nhật thành công.');
          this.hideForm();
          
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
      // Thực hiện thêm mới người dùng
      this.userService.create(apiData).subscribe({
        next: (createdUser) => {
          console.log('User created:', createdUser);
          this.message.success('Người dùng đã được tạo thành công.');
          this.hideForm();
          
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
  // **UserTable Component Methods**
  // ============================================
  /**
   * Xác nhận xóa người dùng
   */
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
        return new Promise((resolve, reject) => {
            this.userService.delete(user.id).subscribe({
              next: () => {
                console.log('Xóa thành công qua API');
                this.message.success(`Đã xóa người dùng "${user.username}"`);
                this.deleteUserFromList(user.id);
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

  /**
   * Xóa người dùng khỏi danh sách hiển thị local
   */
  deleteUserFromList(userId: number): void {
    this.displayData = this.displayData.filter(item => item.id !== userId);
    
    this.total = Math.max(0, this.total - 1);
    
    if (this.displayData.length === 0 && this.pageIndex > 1) {
      this.pageIndex--;
      this.fetchUsers();
    }

    this.setOfCheckedId.delete(userId);
    this.refreshCheckedStatus();
  }

  // ============================================
  // **Checkbox Handling**
  // ============================================
  /**
   * Xử lý khi checkbox "Select All" thay đổi
   */
  onAllChecked(checked: boolean): void {
    this.displayData.forEach(item => this.updateCheckedSet(item.id, checked));
    this.refreshCheckedStatus();
  }

  /**
   * Xử lý khi một checkbox item thay đổi
   */
  onItemChecked(event: {id: number, checked: boolean}): void {
    this.updateCheckedSet(event.id, event.checked);
    this.refreshCheckedStatus();
  }

  /**
   * Cập nhật tập hợp các ID đã chọn
   */
  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  /**
   * Làm mới trạng thái checkbox
   */
  refreshCheckedStatus(): void {
    const listOfEnabledDataOnPage = this.displayData;
    this.checked = listOfEnabledDataOnPage.length > 0 && listOfEnabledDataOnPage.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledDataOnPage.length > 0 && listOfEnabledDataOnPage.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  // ============================================
  // **UserSearchFilter Component Methods**
  // ============================================
  /**
   * Xử lý khi tìm kiếm thay đổi
   */
  onSearchChange(value: string): void {
    this.searchValue = value;
    this.pageIndex = 1;
    this.fetchUsers();
  }

  /**
   * Xử lý khi lựa chọn vai trò thay đổi
   */
  onRoleChange(role: string | null): void {
    this.selectedRole = role;
    this.pageIndex = 1;
    this.fetchUsers();
  }

  /**
   * Xử lý reset các bộ lọc
   */
  onResetFilters(): void {
    this.searchValue = '';
    this.selectedRole = null;
    this.pageIndex = 1;
    this.fetchUsers();
  }

  // ============================================
  // **AdminPagination Component Methods**
  // ============================================
  /**
   * Xử lý khi chuyển trang
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.fetchUsers();
  }

  /**
   * Xử lý khi thay đổi số lượng item/trang
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.fetchUsers();
  }
}