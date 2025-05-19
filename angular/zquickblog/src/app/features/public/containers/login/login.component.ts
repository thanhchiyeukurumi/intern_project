import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
import { finalize, catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

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
    private message: NzMessageService,
    private modalService: NzModalService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
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
        this.loginForm.controls[i].markAsDirty(); // Hiện lỗi ngay nếu có
        this.loginForm.controls[i].updateValueAndValidity(); // Cập nhật lại validation cho field
      }
    }

    if (this.loginForm.invalid) {
      this.message.error('Vui lòng nhập email và mật khẩu hợp lệ');
      return;
    }

    this.isLoading = true;
    const { email, password, rememberMe } = this.loginForm.value;
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];

    // Sử dụng catchError để xử lý lỗi trước khi finalize
    this.authService.login({ email: email, password, rememberMe }, returnUrl)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Nếu lỗi là Unauthorized (401), xử lý ngay tại đây
          if (error.status === 401) {
            this.message.error('Email hoặc mật khẩu không chính xác');
            // Đảm bảo không có token nào được lưu trong storage khi đăng nhập thất bại
            this.authService.removeToken();
          } else {
            this.message.error(error.error?.message || 'Đăng nhập thất bại. Vui lòng thử xem lại email và mật khẩu');
          }
          // Trả về một Observable rỗng để tiếp tục chuỗi xử lý
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.message.success('Đăng nhập thành công!');
            this.router.navigate([returnUrl || '/']);   
          }
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
  }
}