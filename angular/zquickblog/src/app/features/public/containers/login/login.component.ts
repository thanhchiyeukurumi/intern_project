import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
// **** Thêm FormControl vào import ****
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
// import { AuthService } from 'src/app/core/services/auth.service'; // Uncomment nếu dùng

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Cần thiết cho cả hai form
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzDividerModule,
    NzGridModule,
    NzModalModule,
    NzCardModule,
    NzTypographyModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  passwordVisible = false;
  isLoading = false;
  resetPasswordLoading = false;

  // **** Tạo FormControl riêng cho modal ****
  resetEmailControl = new FormControl('', [Validators.required, Validators.email]);

  // Tham chiếu đến modal
  private resetPasswordModalRef: NzModalRef | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private modalService: NzModalService,
    // private authService: AuthService // Uncomment nếu dùng
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  submitForm(): void {
    // Đánh dấu các control là dirty để hiển thị lỗi
    for (const i in this.loginForm.controls) {
      if (this.loginForm.controls.hasOwnProperty(i)) {
        this.loginForm.controls[i].markAsDirty();
        this.loginForm.controls[i].updateValueAndValidity();
      }
    }

    if (this.loginForm.invalid) {
      this.message.error('Please enter valid email and password.');
      return;
    }

    this.isLoading = true;
    const { email, password, rememberMe } = this.loginForm.value;

    console.log('Logging in with:', { email, password, rememberMe });

    // --- Gọi API đăng nhập ở đây ---
    // this.authService.login({ username: email, password, rememberMe }).subscribe({ ... });

    // --- Giả lập API call ---
    setTimeout(() => {
      this.isLoading = false;
      if (email === 'test@example.com' && password === 'password') {
        this.message.success('Login successful! (Simulated)');
        this.router.navigate(['/']); // Chuyển hướng
      } else {
        this.message.error('Invalid credentials. (Simulated)');
      }
    }, 1500);
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  // Mở Modal Reset Password
  showResetPasswordModal(modalContent: TemplateRef<{}>): void {
    // **** Reset FormControl khi mở modal ****
    this.resetEmailControl.reset('');
    this.resetPasswordLoading = false; // Đảm bảo loading state là false

    this.resetPasswordModalRef = this.modalService.create({
      nzTitle: 'Reset Password',
      nzContent: modalContent,
      nzFooter: [ // Footer tùy chỉnh
        {
          label: 'Cancel',
          onClick: () => this.resetPasswordModalRef?.destroy()
        },
        {
          label: 'Send Reset Link',
          type: 'primary',
          loading: this.resetPasswordLoading,
          // Chỉ gọi sendResetLink khi click, validation sẽ được kiểm tra trong hàm đó
          onClick: () => this.sendResetLink()
        }
      ],
      nzClosable: true,
      nzMaskClosable: false
    });
  }

  // Gửi yêu cầu reset password (trong modal)
  sendResetLink(): void {
    // **** Validate và lấy giá trị từ FormControl ****
    this.resetEmailControl.markAsDirty();
    this.resetEmailControl.updateValueAndValidity();

    if (this.resetEmailControl.invalid) {
      // Lỗi sẽ tự động hiển thị qua nzErrorTip trong template
      // Không cần message.error ở đây nữa
      return; // Không tiếp tục nếu không hợp lệ
    }

    this.resetPasswordLoading = true;
    const emailToSend = this.resetEmailControl.value; // Lấy giá trị từ control
    console.log('Sending reset link to:', emailToSend);

    // --- Gọi API gửi link reset ---
    // this.authService.forgotPassword(emailToSend).subscribe({ ... });

    // --- Giả lập API call ---
    setTimeout(() => {
        this.resetPasswordLoading = false;
        this.message.success('Password reset link sent to ' + emailToSend + ' (Simulated)');
        this.resetPasswordModalRef?.destroy(); // Đóng modal sau khi gửi thành công
    }, 1000);
  }
}