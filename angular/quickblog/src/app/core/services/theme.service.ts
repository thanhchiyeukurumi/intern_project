import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { THEME_KEY } from '../constants/storage-keys';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('light');
  currentTheme$ = this.themeSubject.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private storageService: StorageService
  ) {}

  /**
   * Khởi tạo theme khi ứng dụng bắt đầu
   * Thứ tự ưu tiên: localStorage -> prefers-color-scheme -> light (mặc định)
   */
  initTheme(): void {
    // Lấy theme từ localStorage
    const savedTheme = this.storageService.getLocalItem<Theme>(THEME_KEY);

    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this._setTheme(savedTheme);
      return;
    }

    // Kiểm tra prefers-color-scheme của hệ thống
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this._setTheme('dark');
      return;
    }

    // Mặc định là light
    this._setTheme('light');
  }

  /**
   * Chuyển đổi giữa theme sáng và tối
   */
  toggleTheme(): void {
    const currentTheme = this.themeSubject.value;
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
    this._setTheme(newTheme);
  }

  /**
   * Đặt theme cụ thể
   */
  setTheme(theme: Theme): void {
    this._setTheme(theme);
  }

  /**
   * Đặt theme được chỉ định, cập nhật BehaviorSubject, lưu vào localStorage
   * và cập nhật thuộc tính data-theme trên thẻ HTML
   */
  private _setTheme(theme: Theme): void {
    // Cập nhật BehaviorSubject
    this.themeSubject.next(theme);
    
    // Lưu vào localStorage
    this.storageService.setLocalItem(THEME_KEY, theme);
    
    // Cập nhật data-theme trên HTML element
    this.document.documentElement.setAttribute('data-theme', theme);
    
    // Tùy chọn: Cập nhật meta theme-color cho mobile browsers
    const metaThemeColor = this.document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#333333' : '#ffffff');
    }
  }

  /**
   * Lấy theme hiện tại
   */
  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Kiểm tra xem theme hiện tại có phải là dark hay không
   */
  isDarkTheme(): boolean {
    return this.themeSubject.value === 'dark';
  }
}
