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
import { ThemeService } from '../../../../core/services/theme.service';
import { LanguageService } from '../../../../core/services/language.service';
import { Language } from '../../../../shared/models/language.model';
import { finalize } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';

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
    NzSpinModule
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
  
  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadLanguages();
    
    // Initialize dark mode state from ThemeService
    this.darkModeEnabled = this.themeService.isDarkMode();
    
    // Subscribe to theme changes
    this.themeService.darkMode$.subscribe(isDarkMode => {
      this.darkModeEnabled = isDarkMode;
    });
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
}
