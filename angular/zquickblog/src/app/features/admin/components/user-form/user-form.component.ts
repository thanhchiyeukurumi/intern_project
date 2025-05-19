import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { User } from '../../../../shared/models/user.model';
import { Role } from '../../../../shared/models/role.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzSelectModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  @Input() isFormVisible = false;
  @Input() formTitle = 'Thêm người dùng mới';
  @Input() submitButtonText = 'Thêm người dùng';
  @Input() editMode = false;
  @Input() roles: Role[] = [];
  
  // Form fields
  username = '';
  fullname = '';
  email = '';
  password = '';
  confirmPassword = '';
  selectedRoleId: number | null = null;
  avatar = '';
  description = '';

  @Output() formClose = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<{
    username: string;
    fullname: string;
    email: string;
    password: string;
    role_id: number | null;
    avatar: string;
    description: string;
  }>();

  ngOnInit(): void {
    this.resetForm();
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

  updateForm(user: User): void {
    this.username = user.username || '';
    this.fullname = user.fullname || '';
    this.email = user.email || '';
    this.password = ''; // Không đặt mật khẩu để người dùng có thể giữ nguyên mật khẩu hiện tại
    this.confirmPassword = '';
    this.selectedRoleId = user.role_id || null;
    this.avatar = user.avatar || '';
    this.description = user.description || '';
  }

  closeForm(): void {
    this.formClose.emit();
  }

  submitForm(): void {
    if (this.validateForm()) {
      this.formSubmit.emit({
        username: this.username,
        fullname: this.fullname,
        email: this.email,
        password: this.password,
        role_id: this.selectedRoleId,
        avatar: this.avatar,
        description: this.description
      });
    }
  }

  private validateForm(): boolean {
    // Thực hiện validation ở đây
    // Trong ứng dụng thực tế, validation nên được triển khai đầy đủ
    if (!this.username) {
      alert('Vui lòng nhập tên người dùng');
      return false;
    }
    if (!this.email) {
      alert('Vui lòng nhập email');
      return false;
    }
    
    // Chỉ kiểm tra mật khẩu khi không ở chế độ chỉnh sửa
    if (!this.editMode && !this.password) {
      alert('Vui lòng nhập mật khẩu');
      return false;
    }
    
    // Kiểm tra xem mật khẩu và xác nhận có khớp không nếu có nhập mật khẩu
    if (this.password && this.password !== this.confirmPassword) {
      alert('Mật khẩu và xác nhận mật khẩu không khớp');
      return false;
    }
    
    // Kiểm tra vai trò đã được chọn chưa
    if (this.selectedRoleId === null) {
      alert('Vui lòng chọn vai trò cho người dùng');
      return false;
    }
    
    return true;
  }
} 