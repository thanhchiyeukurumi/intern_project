import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzUploadModule, NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { AuthService } from '../../../../core/services/auth.service';
import { UploadService } from '../../../../core/services/upload.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../shared/models/user.model';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-blogger-profile',
  templateUrl: './blogger-profile.component.html',
  styleUrls: ['./blogger-profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAvatarModule,
    NzUploadModule,
    NzTypographyModule
  ]
})
export class BloggerProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  avatarUrl = '';
  isLoading = false;
  currentUser: User | null = null;
  private subscriptions = new Subscription();
  
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private authService: AuthService,
    private uploadService: UploadService,
    private userService: UserService
  ) {}
  
  ngOnInit(): void {
    this.createForm();
    this.loadUserProfile();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  createForm(): void {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      name: ['', Validators.required],
      aboutMe: ['', Validators.required]
    });
  }
  
  loadUserProfile(): void {
    this.isLoading = true;
    
    // Sử dụng AuthService để lấy thông tin người dùng hiện tại
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      this.updateFormWithUserData(this.currentUser);
      this.isLoading = false;
    } else {
      // Nếu chưa có dữ liệu user trong AuthService, gọi loadUserFromToken
      this.authService.loadUserFromToken();
      
      // Đăng ký theo dõi currentUser$ Observable
      const userSub = this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.updateFormWithUserData(user);
        }
        this.isLoading = false;
      });
      
      this.subscriptions.add(userSub);
    }
  }
  
  updateFormWithUserData(user: User): void {
    this.profileForm.patchValue({
      username: user.username || '',
      name: user.fullname || '',
      aboutMe: user.bio || user.description || ''
    });
    
    this.avatarUrl = user.avatar || '';
  }
  
  onSubmit(): void {
    if (this.profileForm.invalid) {
      Object.values(this.profileForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
      return;
    }
    
    if (!this.currentUser?.id) {
      this.message.error('Không thể cập nhật thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }
    
    this.isLoading = true;
    
    const updatedData = {
      fullname: this.profileForm.value.name,
      bio: this.profileForm.value.aboutMe
    };
    
    const updateSub = this.userService.update(this.currentUser.id, updatedData)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (updatedUser) => {
          // Cập nhật lại thông tin người dùng trong localStorage sau khi cập nhật
          if (this.currentUser) {
            this.currentUser = { ...this.currentUser, ...updatedUser };
            // Cập nhật user vào AuthService thông qua phương thức loadUserFromToken
            this.authService.loadUserFromToken();
          }
          this.message.success('Hồ sơ đã được cập nhật thành công');
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật hồ sơ:', err);
          this.message.error('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
        }
      });
    
    this.subscriptions.add(updateSub);
  }
  
  fileList: NzUploadFile[] = [];

  beforeUpload = (file: NzUploadFile): boolean => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      this.message.error('Bạn chỉ có thể tải lên file JPG hoặc PNG!');
      return false;
    }
    
    const isLt2M = file.size !== undefined && file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.message.error('Ảnh phải nhỏ hơn 2MB!');
      return false;
    }
    
    // Sử dụng handleUpload để xử lý việc upload và cập nhật avatar
    this.handleUpload(file);
    return false; // Ngăn upload mặc định của nz-upload
  };
  
  customUpload = (item: NzUploadXHRArgs): Subscription => {
    // Tạo FormData
    const formData = new FormData();
    formData.append('image', item.file as any);
    formData.append('type', 'avatar');
    
    // Hiển thị loading khi đang upload
    const uploadingMsg = this.message.loading('Đang tải lên...', { nzDuration: 0 }).messageId;
    
    // Gọi upload service
    const uploadSub = this.uploadService.uploadSingleImage(item.file as any, 'avatar')
      .pipe(
        finalize(() => this.message.remove(uploadingMsg))
      )
      .subscribe({
        next: (res) => {
          // Cập nhật URL avatar
          if (res && res.data && res.data.url) {
            this.updateUserAvatar(res.data.url);
          }
          // Gọi success callback
          item.onSuccess!(res, item.file, {});
        },
        error: (err) => {
          this.message.error('Tải lên avatar thất bại');
          item.onError!(err, item.file);
        }
      });
    
    return uploadSub;
  };
  
  private handleUpload(file: NzUploadFile): void {
    if (!file || !this.currentUser?.id) {
      this.message.error('Không thể tải lên avatar. Vui lòng đăng nhập lại.');
      return;
    }
    
    // Hiển thị loading khi đang upload
    this.isLoading = true;
    const uploadingMsg = this.message.loading('Đang tải lên...', { nzDuration: 0 }).messageId;
    
    // Upload file
    const uploadSub = this.uploadService.uploadSingleImage(file as any, 'avatar')
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.message.remove(uploadingMsg);
        })
      )
      .subscribe({
        next: (res) => {
          if (res && res.data && res.data.url) {
            // Hiển thị preview trước khi cập nhật lên server
            this.avatarUrl = res.data.url;
            // Cập nhật URL avatar cho user
            this.updateUserAvatar(res.data.url);
          }
        },
        error: (err) => {
          console.error('Lỗi khi tải lên avatar:', err);
          this.message.error('Không thể tải lên avatar. Vui lòng thử lại.');
        }
      });
    
    this.subscriptions.add(uploadSub);
  }
  
  private updateUserAvatar(avatarUrl: string): void {
    if (!this.currentUser?.id) {
      this.message.error('Không thể cập nhật avatar. Vui lòng đăng nhập lại.');
      return;
    }
    
    // Cập nhật URL avatar cho user thông qua UserService
    const updateSub = this.userService.update(this.currentUser.id, { avatar: avatarUrl })
      .subscribe({
        next: (updatedUser) => {
          // Cập nhật lại thông tin người dùng trong local state
          if (this.currentUser) {
            this.currentUser = { ...this.currentUser, ...updatedUser };
            // Cập nhật vào AuthService bằng cách gọi loadUserFromToken
            this.authService.loadUserFromToken();
          }
          this.message.success('Avatar đã được cập nhật thành công');
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật avatar:', err);
          this.message.error('Không thể cập nhật avatar. Vui lòng thử lại.');
        }
      });
    
    this.subscriptions.add(updateSub);
  }
}