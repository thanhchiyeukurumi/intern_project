import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzUploadModule, NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { ThemeService } from '../../../../core/services/theme.service';
import { LanguageService } from '../../../../core/services/language.service';
import { UploadService } from '../../../../core/services/upload.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Language } from '../../../../shared/models/language.model';
import { User } from '../../../../shared/models/user.model';
import { finalize } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-setting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTabsModule,
    NzSwitchModule,
    NzSelectModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzSpinModule,
    NzUploadModule
  ],
  templateUrl: './admin-setting.component.html',
  styleUrl: './admin-setting.component.css'
})
export class AdminSettingComponent implements OnInit {
  darkModeEnabled = false;
  emailNotifications = true;
  backupFrequency = 'weekly';
  newLanguage = '';
  newLanguageCode = '';
  languages: Language[] = [];
  isLoading = false;
  currentAvatar: string | null = null;
  isUploading = false;
  currentUser: User | null = null;
  
  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService,
    private uploadService: UploadService,
    private userService: UserService,
    private authService: AuthService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadLanguages();
    this.loadCurrentUser();
    
    // Initialize dark mode state from ThemeService
    this.darkModeEnabled = this.themeService.isDarkMode();
    
    // Subscribe to theme changes
    this.themeService.darkMode$.subscribe(isDarkMode => {
      this.darkModeEnabled = isDarkMode;
    });

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.currentAvatar = user.avatar;
      }
    });
  }

  loadCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
      this.currentAvatar = user.avatar;
    } else {
      this.message.error('Vui lòng đăng nhập để tiếp tục');
    }
  }
  
  loadLanguages(): void {
    this.isLoading = true;
    this.languageService.getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.languages = response.data;
        },
        error: (err) => {
          console.error('Lỗi khi tải ngôn ngữ:', err);
          this.message.error('Không thể tải danh sách ngôn ngữ. Vui lòng thử lại sau.');
        }
      });
  }
  
  addLanguage(): void {
    if (this.newLanguage && this.newLanguageCode) {
      this.isLoading = true;
      
      const newLanguageData = {
        name: this.newLanguage,
        locale: this.newLanguageCode,
        is_active: true
      };
      
      this.languageService.create(newLanguageData)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (createdLanguage) => {
            this.languages.push(createdLanguage);
            this.message.success('Thêm ngôn ngữ mới thành công');
            this.newLanguage = '';
            this.newLanguageCode = '';
          },
          error: (err) => {
            console.error('Lỗi khi thêm ngôn ngữ:', err);
            this.message.error('Không thể thêm ngôn ngữ mới. Vui lòng thử lại sau.');
          }
        });
    }
  }
  
  removeLanguage(id: number): void {
    this.isLoading = true;
    
    this.languageService.delete(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {
          this.languages = this.languages.filter(lang => lang.id !== id);
          this.message.success('Xóa ngôn ngữ thành công');
        },
        error: (err) => {
          console.error('Lỗi khi xóa ngôn ngữ:', err);
          this.message.error('Không thể xóa ngôn ngữ. Vui lòng thử lại sau.');
        }
      });
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      this.message.error('Chỉ chấp nhận file JPG/PNG!');
      return false;
    }
    const isLt2M = file.size! / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
      return false;
    }
    return true;
  };

  handleUpload = (item: NzUploadXHRArgs): Subscription => {
    this.isUploading = true;
    const file = item.file as unknown as File;
    
    return this.uploadService.uploadSingleImage(file, 'avatar')
      .pipe(
        finalize(() => {
          this.isUploading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (this.currentUser) {
            // Cập nhật avatar trong database
            this.userService.update(this.currentUser.id, { avatar: response.data.url })
              .subscribe({
                next: (updatedUser) => {
                  this.currentUser = updatedUser;
                  this.currentAvatar = updatedUser.avatar;
                  this.message.success('Cập nhật avatar thành công!');
                  if (item.onSuccess) {
                    item.onSuccess(response, item.file, item.file);
                  }
                },
                error: (err) => {
                  console.error('Lỗi khi cập nhật avatar:', err);
                  this.message.error('Không thể cập nhật avatar. Vui lòng thử lại sau.');
                  if (item.onError) {
                    item.onError(err, item.file);
                  }
                }
              });
          }
        },
        error: (err) => {
          console.error('Lỗi khi upload avatar:', err);
          this.message.error('Không thể upload avatar. Vui lòng thử lại sau.');
          if (item.onError) {
            item.onError(err, item.file);
          }
        }
      });
  };
}
