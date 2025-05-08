import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CATEGORY_API } from '../../core/constants/api-endpoints';
import { CategoryDto } from '../../shared/models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  // ============================================
  // LẤY TẤT CẢ DANH MỤC - getAll
  // ============================================
  /**
   * Lấy danh sách danh mục với các tùy chọn phân trang và lọc
   * @param params - Các tùy chọn để lọc và phân trang
   * @returns Observable - Dữ liệu danh mục và thông tin phân trang
   */ 
  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<any>(CATEGORY_API.BASE, { params: httpParams });
  }

  // ============================================
  // LẤY DANH MỤC THEO ID - getById
  // ============================================
  /**
   * Lấy thông tin danh mục theo ID
   * @param id - ID của danh mục
   * @returns Observable - Dữ liệu danh mục
   */ 
  getById(id: number | string): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(CATEGORY_API.GET_BY_ID(id));
  }

  // ============================================
  // TẠO DANH MỤC - create
  // ============================================
  /**
   * Tạo danh mục mới
   * @param data - Dữ liệu danh mục
   * @returns Observable - Dữ liệu danh mục đã tạo
   */ 
  create(data: CategoryDto): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(CATEGORY_API.BASE, data);
  }

  // ============================================
  // CẬP NHẬT DANH MỤC - update
  // ============================================
  /**
   * Cập nhật thông tin danh mục
   * @param id - ID của danh mục  
   * @param data - Dữ liệu danh mục 
   * @returns Observable - Dữ liệu danh mục đã cập nhật
   */ 
  update(id: number | string, data: Partial<CategoryDto>): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(CATEGORY_API.GET_BY_ID(id), data);
  }

  // ============================================
  // XÓA DANH MỤC - delete
  // ============================================
  /**
   * Xóa danh mục
   * @param id - ID của danh mục
   * @returns Observable - Dữ liệu danh mục đã xóa
   */ 
  delete(id: number | string): Observable<any> {
    return this.http.delete<any>(CATEGORY_API.GET_BY_ID(id));
  }
}
