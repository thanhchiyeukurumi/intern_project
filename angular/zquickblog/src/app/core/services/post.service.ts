import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { POST_API } from '../../core/constants/api-endpoints';
import { Post, PostDto } from '../../shared/models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private http: HttpClient) {}

  // ============================================
  // LẤY TẤT CẢ BÀI VIẾT - getAll
  // ============================================
  /**
   * Lấy danh sách bài viết với các tùy chọn phân trang và lọc
   * @param params - Các tùy chọn để lọc và phân trang
   * @returns Observable - Dữ liệu bài viết và thông tin phân trang
   */ 
  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string | number;
    languageId?: string | number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
    includeRelations?: boolean;
    userId?: number;
    originalPost?: string | boolean;
  }): Observable<{ data: Post[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: Post[]; pagination: any }>(POST_API.BASE, { params: httpParams });
  }

  // ============================================
  // LẤY BÀI VIẾT THEO ID - getById
  // ============================================
  /**
   * Lấy thông tin bài viết theo ID
   * @param id - ID của bài viết
   * @returns Observable - Dữ liệu bài viết
   */ 
  getById(id: number | string): Observable<Post> {
    return this.http.get<Post>(POST_API.GET_BY_ID(id));
  }

  // ============================================
  // TẠO BÀI VIẾT - create
  // ============================================
  /**
   * Tạo bài viết mới
   * @param data - Dữ liệu bài viết 
   * @returns Observable - Dữ liệu bài viết đã tạo  
   */ 
  create(data: PostDto): Observable<Post> {
    return this.http.post<Post>(POST_API.BASE, data);
  }

  // ============================================
  // CẬP NHẬT BÀI VIẾT - update
  // ============================================
  /**
   * Cập nhật thông tin bài viết
   * @param id - ID của bài viết  
   * @param data - Dữ liệu bài viết   
   * @returns Observable - Dữ liệu bài viết đã cập nhật  
   */ 
  update(id: number | string, data: Partial<PostDto>): Observable<Post> {
    return this.http.put<Post>(POST_API.GET_BY_ID(id), data);
  }

  // ============================================
  // XÓA BÀI VIẾT - delete
  // ============================================
  /**
   * Xóa bài viết
   * @param id - ID của bài viết  
   * @returns Observable - Dữ liệu bài viết đã xóa    
   */ 
  delete(id: number | string): Observable<any> {
    return this.http.delete<any>(POST_API.GET_BY_ID(id));
  }

  // ============================================
  // TÌM KIẾM BÀI VIẾT - search
  // ============================================
  /**
   * Tìm kiếm bài viết với các tùy chọn phân trang và lọc
   * @param params - Các tùy chọn để lọc và phân trang
   * @returns Observable - Dữ liệu bài viết và thông tin phân trang
   */ 
  search(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string | number;
    languageId?: string | number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }): Observable<{ data: Post[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: Post[]; pagination: any }>(POST_API.SEARCH, { params: httpParams });
  }

  // ============================================
  // LẤY BÀI VIẾT THEO DANH MỤC - getByCategory
  // ============================================
  /**
   * Lấy danh sách bài viết theo danh mục với các tùy chọn phân trang và lọc
   * @param categoryId - ID của danh mục  
   * @param params - Các tùy chọn để lọc và phân trang
   * @returns Observable - Dữ liệu bài viết và thông tin phân trang
   */ 
  getByCategory(categoryId: number | string, params?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }): Observable<{ data: Post[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: Post[]; pagination: any }>(POST_API.GET_BY_CATEGORY(categoryId), { params: httpParams });
  }

  // ============================================
  // LẤY BÀI VIẾT THEO NGƯỜI DÙNG - getByUser
  // ============================================
  /**
   * Lấy danh sách bài viết theo người dùng với các tùy chọn phân trang và lọc
   * @param userId - ID của người dùng  
   * @param params - Các tùy chọn để lọc và phân trang
   * @returns Observable - Dữ liệu bài viết và thông tin phân trang
   */ 
  getByUser(userId: number | string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string | number;
    languageId?: string | number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
    includeRelations?: boolean;
        originalPost?: string | boolean;
  }): Observable<{ data: Post[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: Post[]; pagination: any }>(POST_API.GET_BY_USER(userId), { params: httpParams });
  }

   // ============================================
  // LẤY DANH SÁCH BÀI VIẾT TỪ BÀI GỐC - getPostsFromOriginal
  // ============================================
  /**
   * Lấy danh sách các bài viết được dịch/phát triển từ một bài viết gốc
   * @param originalPostId - ID của bài viết gốc
   * @param params - Tùy chọn phân trang và lọc (page, limit, orderBy, order, includeRelations)
   * @returns Observable - Danh sách bài viết và thông tin phân trang
   */
  getPostsFromOriginal(originalPostId: number | string, params?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
    includeRelations?: boolean;
    // Không cần fromOriginalPostId hay originalPost ở đây vì backend service đã xử lý từ route
  }): Observable<{ data: Post[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
           // Backend controller getPostsFromOriginal mong đợi includeRelations là chuỗi 'true' hoặc 'false'
           if (key === 'includeRelations' && typeof value === 'boolean') {
               httpParams = httpParams.set(key, value.toString());
           } else {
               httpParams = httpParams.set(key, value as any);
           }
        }
      });
    }
    const url = POST_API.GET_FROM_ORIGINAL(originalPostId);
    return this.http.get<{ data: Post[]; pagination: any }>(url, { params: httpParams });
  }

  // ============================================
  // LẤY THỐNG KÊ BÀI VIẾT THEO KHOẢNG THỜI GIAN - getPostsByDateRange
  // ============================================
  /**
   * Lấy thống kê bài viết theo khoảng thời gian
   * @param options - Các tùy chọn để lọc và nhóm dữ liệu
   * @returns Observable - Dữ liệu thống kê bài viết theo thời gian
   */
  getPostsByDateRange(options: {
    startDate?: string; 
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
    languageId?: string | number;
    categoryId?: string | number;
    userId?: string | number;
    includeTotal?: boolean;
  }): Observable<any> {
    let httpParams = new HttpParams();
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    
    return this.http.get(POST_API.STATS_DATE_RANGE, { params: httpParams });
  }

  // ============================================
  // LẤY THỐNG KÊ BÀI VIẾT - getPostStats
  // ============================================
  /**
   * Lấy thống kê tổng hợp về bài viết
   * @param options - Các tùy chọn thống kê
   * @returns Observable - Dữ liệu thống kê bài viết
   */
  getPostStats(options: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Observable<any> {
    let httpParams = new HttpParams();
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    
    return this.http.get(POST_API.STATS_DASHBOARD, { params: httpParams });
  }
}
