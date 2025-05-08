import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  // ============================================
  // LƯU GIÁ TRỊ VÀO LOCALSTORAGE - setLocalItem
  // ============================================
  /**
   * Lưu giá trị vào localStorage
   * @param key - Khóa lưu trữ
   * @param value - Giá trị cần lưu
   */
  setLocalItem(key: string, value: any): void {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (e) {
      console.error('Lỗi khi lưu vào localStorage:', e);
    }
  }

  // ============================================
  // LẤY GIÁ TRỊ TỪ LOCALSTORAGE - getLocalItem
  // ============================================
  /**
   * Lấy giá trị từ localStorage
   * @param key - Khóa lưu trữ
   * @returns Giá trị đã lưu trữ hoặc null nếu không tồn tại
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

  // ============================================
  // XÓA ITEM KHỎI LOCALSTORAGE - removeLocalItem
  // ============================================
  /**
   * Xóa item khỏi localStorage
   * @param key - Khóa lưu trữ
   * @returns void
   */
  removeLocalItem(key: string): void {
    localStorage.removeItem(key);
  }

  // ============================================
  // XÓA TẤT CẢ DỮ LIỆU KHỎI LOCALSTORAGE - clearLocalStorage
  // ============================================
  /**
   * Xóa tất cả dữ liệu khỏi localStorage
   * @returns void
   */
  clearLocalStorage(): void {
    localStorage.clear();
  }

}
