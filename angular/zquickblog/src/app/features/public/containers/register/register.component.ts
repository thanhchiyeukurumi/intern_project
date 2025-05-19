import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; // Thêm ActivatedRoute
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid'; // For social buttons layout
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { AuthService } from '../../../../core/services/auth.service';

// Custom Validator function để kiểm tra mật khẩu khớp nhau
export const matchPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  // Chỉ kiểm tra nếu cả hai trường đã được chạm vào hoặc có giá trị
  if (password && confirmPassword && (password.dirty || password.touched || confirmPassword.dirty || confirmPassword.touched)) {
    return password.value === confirmPassword.value ? null : { passwordsNotMatching: true };
  }
  return null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule, // Thêm RouterModule
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzDividerModule,
    NzGridModule,
    NzCardComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  passwordVisible = false;
  confirmPasswordVisible = false; // Thêm cho confirm password nếu muốn
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private authService: AuthService,
    private route: ActivatedRoute // Thêm ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      userName: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/) // Regex ví dụ: ít nhất 1 số, 1 ký tự đặc biệt
      ]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
      newsletter: [false]
    }, { validators: matchPasswordValidator }); // Áp dụng validator ở cấp FormGroup
  }

  submitForm(): void {
    // Đánh dấu tất cả các trường là touched để hiển thị lỗi nếu chưa hợp lệ
    for (const i in this.registerForm.controls) {
      if (this.registerForm.controls.hasOwnProperty(i)) {
        this.registerForm.controls[i].markAsDirty();
        this.registerForm.controls[i].updateValueAndValidity();
      }
    }
     // Cập nhật lại trạng thái lỗi của FormGroup sau khi kiểm tra control con
     this.registerForm.updateValueAndValidity();

    if (this.registerForm.invalid) {
       // Kiểm tra lỗi cụ thể passwordsNotMatching
       if (this.registerForm.errors?.['passwordsNotMatching'] && this.registerForm.get('confirmPassword')?.dirty) {
         this.message.error('Passwords do not match!');
       } else {
         this.message.error('Please fill in the form correctly.');
       }
      return;
    }

    this.isLoading = true;
    const { fullName, email, password, userName, newsletter } = this.registerForm.value;
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];

    console.log('Registering with:', { fullName, email, password, newsletter });

    this.authService.register({ username: userName, fullname: fullName, email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message.success('Account created successfully! Please check your email for verification.');
        
        // Chuyển hướng đến trang đăng nhập với returnUrl nếu có
        if (returnUrl) {
          this.router.navigate(['/login'], { queryParams: { returnUrl } });
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.message.error(error.message || 'Registration failed. Please try again.');
        console.error('Registration error:', error);
      }
    });
  }

  // Hàm toggle cho password chính
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

   // Hàm toggle cho confirm password (tùy chọn)
   toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}