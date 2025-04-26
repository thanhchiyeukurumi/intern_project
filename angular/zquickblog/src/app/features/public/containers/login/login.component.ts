import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { AuthService } from '../../../../core/services/auth.service'
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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

  resetEmailControl = new FormControl('', [Validators.required, Validators.email]);

  private resetPasswordModalRef: NzModalRef | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private modalService: NzModalService,
    private authService: AuthService
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
      this.message.error('Vui lòng nhập email và mật khẩu hợp lệ.');
      return;
    }

    this.isLoading = true;
    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email: email, password, rememberMe })
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: any) => {
          this.message.success('Đăng nhập thành công!');
          // Chuyển hướng sẽ được quản lý bởi AuthService
        },
        error: (error: any) => {
          this.message.error(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
        }
      });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  // Mở Modal Reset Password
  showResetPasswordModal(modalContent: TemplateRef<{}>): void {
    this.resetEmailControl.reset('');
    this.resetPasswordLoading = false;

    this.resetPasswordModalRef = this.modalService.create({
      nzTitle: 'Khôi phục mật khẩu',
      nzContent: modalContent,
      nzFooter: [
        {
          label: 'Hủy',
          onClick: () => this.resetPasswordModalRef?.destroy()
        },
        {
          label: 'Gửi liên kết khôi phục',
          type: 'primary',
          loading: this.resetPasswordLoading,
          onClick: () => this.sendResetLink()
        }
      ],
      nzClosable: true,
      nzMaskClosable: false
    });
  }

  // Gửi yêu cầu reset password (trong modal)
  sendResetLink(): void {
    this.resetEmailControl.markAsDirty();
    this.resetEmailControl.updateValueAndValidity();

    if (this.resetEmailControl.invalid) {
      return;
    }

    this.resetPasswordLoading = true;
    const emailToSend = this.resetEmailControl.value;
    
    // Giả lập gọi API khôi phục mật khẩu (cần bổ sung endpoint trong AuthService)
    setTimeout(() => {
      this.resetPasswordLoading = false;
      this.message.success('Đã gửi liên kết khôi phục mật khẩu đến ' + emailToSend);
      this.resetPasswordModalRef?.destroy();
    }, 1000);
    
    // TODO: Khi có API reset password, cần thay thế đoạn giả lập bên trên
    // this.authService.forgotPassword(emailToSend)
    //   .pipe(
    //     finalize(() => this.resetPasswordLoading = false)
    //   )
    //   .subscribe({
    //     next: () => {
    //       this.message.success('Đã gửi liên kết khôi phục mật khẩu đến ' + emailToSend);
    //       this.resetPasswordModalRef?.destroy();
    //     },
    //     error: (error: any) => {
    //       this.message.error(error.message || 'Không thể gửi liên kết khôi phục mật khẩu.');
    //     }
    //   });
  }
}