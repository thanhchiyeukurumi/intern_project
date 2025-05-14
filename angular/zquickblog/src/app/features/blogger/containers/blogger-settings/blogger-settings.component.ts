import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { LanguageService } from '../../../../core/services/language.service';
import { User } from '../../../../shared/models/user.model';
import { finalize, Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface BlogSettings {
  blogName: string;
  blogDescription: string;
  defaultLanguage: string;
  postsPerPage: number;
  enableComments: boolean;
}

@Component({
  selector: 'app-blogger-settings',
  templateUrl: './blogger-settings.component.html',
  styleUrls: ['./blogger-settings.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzSwitchModule,
    NzTabsModule,
    NzTypographyModule,
    NzDividerModule,
    NzIconModule,
    NzInputNumberModule,
    NzModalModule
  ]
})
export class BloggerSettingsComponent implements OnInit, OnDestroy {
  generalForm!: FormGroup;
  privacyForm!: FormGroup;
  integrationForm!: FormGroup;
  isLoading = false;
  
  defaultLanguageOptions: { label: string; value: string }[] = [];
  currentUser: User | null = null;
  private subscriptions = new Subscription();
  
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private authService: AuthService,
    private userService: UserService,
    private languageService: LanguageService,
    private modal: NzModalService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.createForms();
    this.loadLanguages();
    this.loadSettings();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  createForms(): void {
    this.generalForm = this.fb.group({
      blogName: [''],
      blogDescription: [''],
      defaultLanguage: ['en'],
      postsPerPage: [10],
      enableComments: [true]
    });
    
    this.privacyForm = this.fb.group({
      makeProfilePublic: [true],
      showEmail: [false],
      allowSearchEngines: [true],
      cookieConsent: [true],
      dataCollection: [true]
    });
    
    this.integrationForm = this.fb.group({
      googleAnalyticsId: [''],
      facebookPixelId: [''],
      disqusShortname: ['']
    });
  }
  
  loadLanguages(): void {
    this.isLoading = true;
    const langSub = this.languageService.getAll()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            this.defaultLanguageOptions = res.data
              .filter(lang => lang.is_active)
              .map(lang => ({
                label: lang.name,
                value: lang.locale
              }));
          }
        },
        error: (err) => {
          console.error('Lỗi khi tải danh sách ngôn ngữ:', err);
          this.message.error('Không thể tải danh sách ngôn ngữ. Vui lòng thử lại sau.');
          // Fallback to default languages if API fails
          this.defaultLanguageOptions = [
            { label: 'Tiếng Anh', value: 'en' },
            { label: 'Tiếng Việt', value: 'vi' }
          ];
        }
      });
    
    this.subscriptions.add(langSub);
  }
  
  loadSettings(): void {
    this.isLoading = true;
    
    // Lấy thông tin người dùng hiện tại
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      this.loadUserSettings(this.currentUser);
    } else {
      // Nếu chưa có dữ liệu user, lấy từ token hoặc localStorage
      const userSub = this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.loadUserSettings(user);
        } else {
          this.message.error('Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.');
          this.router.navigate(['/login']);
        }
      });
      
      this.subscriptions.add(userSub);
    }
  }
  
  loadUserSettings(user: User): void {
    if (!user.id) {
      this.isLoading = false;
      return;
    }
    
    // Nếu có settings lưu trong user.data, load từ đó
    if (user.data && user.data.settings) {
      this.updateFormWithSettings(user.data.settings);
      this.isLoading = false;
    } else {
      // Nếu không, gọi API để lấy
      const settingsSub = this.userService.getById(user.id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (userData) => {
            if (userData && userData.data && userData.data.settings) {
              this.updateFormWithSettings(userData.data.settings);
            } else {
              // Nếu không có settings, sử dụng giá trị mặc định
              const defaultSettings: BlogSettings = {
                blogName: `${user.fullname || user.username}'s Blog`,
                blogDescription: 'Thoughts on programming, design, and tech',
                defaultLanguage: 'en',
                postsPerPage: 10,
                enableComments: true
              };
              this.updateFormWithSettings(defaultSettings);
            }
          },
          error: (err) => {
            console.error('Lỗi khi tải cài đặt người dùng:', err);
            this.message.error('Không thể tải cài đặt người dùng. Vui lòng thử lại sau.');
          }
        });
      
      this.subscriptions.add(settingsSub);
    }
  }
  
  updateFormWithSettings(settings: BlogSettings): void {
    this.generalForm.patchValue({
      blogName: settings.blogName || '',
      blogDescription: settings.blogDescription || '',
      defaultLanguage: settings.defaultLanguage || 'en',
      postsPerPage: settings.postsPerPage || 10,
      enableComments: settings.enableComments !== undefined ? settings.enableComments : true
    });
  }
  
  saveGeneralSettings(): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.message.error('Không thể lưu cài đặt. Vui lòng đăng nhập lại.');
      return;
    }
    
    this.isLoading = true;
    
    const settings = {
      ...this.currentUser.data?.settings || {},
      ...this.generalForm.value
    };
    
    // Cập nhật settings vào user.data
    const userData = {
      data: {
        ...this.currentUser.data,
        settings
      }
    };
    
    const saveSub = this.userService.update(this.currentUser.id, userData)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (updatedUser) => {
          // Cập nhật thông tin người dùng trong AuthService
          if (this.currentUser) {
            this.currentUser = { ...this.currentUser, ...updatedUser };
            // Cập nhật vào AuthService
            this.authService.loadUserFromToken();
          }
          this.message.success('Đã lưu cài đặt chung thành công');
        },
        error: (err) => {
          console.error('Lỗi khi lưu cài đặt:', err);
          this.message.error('Không thể lưu cài đặt. Vui lòng thử lại sau.');
        }
      });
    
    this.subscriptions.add(saveSub);
  }
  
  savePrivacySettings(): void {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.message.success('Privacy settings saved successfully');
    }, 800);
  }
  
  saveIntegrationSettings(): void {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.message.success('Integration settings saved successfully');
    }, 800);
  }
  
  exportData(): void {
    this.message.info('Exporting your data, this may take a moment...');
    
    // Simulate export
    setTimeout(() => {
      this.message.success('Data exported successfully. Check your email for the download link.');
    }, 1500);
  }
  
  deleteAccount(): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.message.error('Không thể xóa tài khoản. Vui lòng đăng nhập lại.');
      return;
    }
    
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa tài khoản',
      nzContent: 'Bạn có chắc chắn muốn xóa tài khoản của mình? Hành động này không thể hoàn tác.',
      nzOkText: 'Xóa tài khoản',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isLoading = true;
        
        const deleteSub = this.userService.delete(this.currentUser!.id)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.message.success('Tài khoản đã được xóa thành công');
              // Đăng xuất người dùng
              this.authService.logout();
              this.router.navigate(['/login']);
            },
            error: (err) => {
              console.error('Lỗi khi xóa tài khoản:', err);
              this.message.error('Không thể xóa tài khoản. Vui lòng thử lại sau.');
            }
          });
        
        this.subscriptions.add(deleteSub);
      },
      nzCancelText: 'Hủy'
    });
  }
}