import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  /**
   * Lưu giá trị vào localStorage
   */
  setLocalItem(key: string, value: any): void {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (e) {
      console.error('Lỗi khi lưu vào localStorage:', e);
    }
  }

  /**
   * Lấy giá trị từ localStorage
   */
  getLocalItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (e) {
      console.error('Lỗi khi đọc từ localStorage:', e);
      return null;
    }
  }

  /**
   * Xóa item khỏi localStorage
   */
  removeLocalItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Xóa tất cả dữ liệu khỏi localStorage
   */
  clearLocalStorage(): void {
    localStorage.clear();
  }

}
