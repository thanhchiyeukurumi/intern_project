import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { USER_API } from '../../core/constants/api-endpoints';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
    includeRelations: boolean;
  }): Observable<{ data: User[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: User[]; pagination: any }>(USER_API.BASE, { params: httpParams });
  }

  getById(id: number | string): Observable<User> {
    return this.http.get<User>(USER_API.GET_BY_ID(id));
  }

  create(data: Partial<User>): Observable<User> {
    return this.http.post<User>(USER_API.BASE, data);
  }

  update(id: number | string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(USER_API.GET_BY_ID(id), data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete<any>(USER_API.GET_BY_ID(id));
  }

  // ============================================
  // LẤY THỐNG KÊ NGƯỜI DÙNG THEO KHOẢNG THỜI GIAN - getUsersByDateRange
  // ============================================
  /**
   * Lấy thống kê người dùng theo khoảng thời gian
   * @param options - Các tùy chọn để lọc và nhóm dữ liệu
   * @returns Observable - Dữ liệu thống kê người dùng theo thời gian
   */
  getUsersByDateRange(options: {
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
    
    return this.http.get(USER_API.STATS_DATE_RANGE, { params: httpParams });
  }

  // ============================================
  // LẤY THỐNG KÊ NGƯỜI DÙNG - getUserStats
  // ============================================
  /**
   * Lấy thống kê tổng hợp về người dùng
   * @param options - Các tùy chọn để lọc
   * @returns Observable - Thống kê tổng hợp về người dùng
   */
  getUserStats(options: {
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
    
    return this.http.get(USER_API.STATS_DASHBOARD, { params: httpParams });
  }

  // ============================================
  // LẤY TOP NGƯỜI DÙNG ĐÓNG GÓP - getTopContributors
  // ============================================
  /**
   * Lấy danh sách top người dùng đóng góp nhiều bài viết nhất
   * @param options - Các tùy chọn để lọc
   * @returns Observable - Danh sách top người dùng đóng góp
   */
  getTopContributors(options: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    
    return this.http.get(USER_API.STATS_TOP_CONTRIBUTORS, { params: httpParams });
  }
}
