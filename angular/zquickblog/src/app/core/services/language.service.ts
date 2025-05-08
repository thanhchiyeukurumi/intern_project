import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LANGUAGE_API } from '../../core/constants/api-endpoints';
import { LanguageDto, Language } from '../../shared/models/language.model';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(private http: HttpClient) {}

  // ============================================
  // LẤY TẤT CẢ NGÔN NGỮ - getAll
  // ============================================
  /**
   * Lấy danh sách ngôn ngữ với các tùy chọn phân trang và lọc
   * @param params - Các tùy chọn để lọc và phân trang  
   * @returns Observable - Dữ liệu ngôn ngữ và thông tin phân trang
   */ 
  getAll(params?: {
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }): Observable<{ data: Language[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: Language[]; pagination: any }>(LANGUAGE_API.BASE, { params: httpParams });
  }

  // ============================================
  // LẤY NGÔN NGỮ THEO ID - getById
  // ============================================
  /**
   * Lấy thông tin ngôn ngữ theo ID
   * @param id - ID của ngôn ngữ  
   * @returns Observable - Dữ liệu ngôn ngữ 
   */ 
  getById(id: number | string): Observable<Language> {
    return this.http.get<Language>(LANGUAGE_API.GET_BY_ID(id));
  }

  // ============================================
  // TẠO NGÔN NGỮ - create
  // ============================================
  /**
   * Tạo ngôn ngữ mới
   * @param data - Dữ liệu ngôn ngữ 
   * @returns Observable - Dữ liệu ngôn ngữ đã tạo  
   */ 
  create(data: LanguageDto): Observable<Language> {
    return this.http.post<Language>(LANGUAGE_API.BASE, data);
  }

  // ============================================
  // CẬP NHẬT NGÔN NGỮ - update
  // ============================================
  /**
   * Cập nhật thông tin ngôn ngữ
   * @param id - ID của ngôn ngữ   
   * @param data - Dữ liệu ngôn ngữ     
   * @returns Observable - Dữ liệu ngôn ngữ đã cập nhật
   */ 
  update(id: number | string, data: Partial<LanguageDto>): Observable<Language> {
    return this.http.put<Language>(LANGUAGE_API.GET_BY_ID(id), data);
  }

  // ============================================
  // XÓA NGÔN NGỮ - delete
  // ============================================
  /**
   * Xóa ngôn ngữ
   * @param id - ID của ngôn ngữ   
   * @returns Observable - Dữ liệu ngôn ngữ đã xóa  
   */ 
  delete(id: number | string): Observable<any> {
    return this.http.delete<any>(LANGUAGE_API.GET_BY_ID(id));
  }
}
