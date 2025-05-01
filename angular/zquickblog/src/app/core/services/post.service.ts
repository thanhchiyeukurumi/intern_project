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

  getById(id: number | string): Observable<Post> {
    return this.http.get<Post>(POST_API.GET_BY_ID(id));
  }

  create(data: PostDto): Observable<Post> {
    return this.http.post<Post>(POST_API.BASE, data);
  }

  update(id: number | string, data: Partial<PostDto>): Observable<Post> {
    return this.http.put<Post>(POST_API.GET_BY_ID(id), data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete<any>(POST_API.GET_BY_ID(id));
  }

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

    // Sử dụng endpoint mới và truyền originalPostId vào URL
    const url = POST_API.GET_FROM_ORIGINAL(originalPostId);

    // Thực hiện request GET với URL và các query params
    return this.http.get<{ data: Post[]; pagination: any }>(url, { params: httpParams });
  }

}
