import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { StorageService } from './storage.service';
import { AUTH_TOKEN_KEY, USER_INFO_KEY } from '../constants/storage-keys';
import { AUTH_API } from '../constants/api-endpoints';
@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = '/api/auth'; // API base URL cho xác thực
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {
    // Kiểm tra trạng thái đăng nhập khi khởi tạo service
    this.loadUserFromToken();
  }

  /**
   * Lấy trạng thái đăng nhập hiện tại, trả về true nếu đã đăng nhập, ngược lại trả về false
   */
  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  /**
   * Lấy thông tin người dùng hiện tại
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Lấy role của người dùng hiện tại
   */
  getRole(): string | null {
    const user = this.currentUserSubject.value;
    if (!user) return null;
    
    // Kiểm tra cấu trúc API mới
    if (user.role && user.role.name) {
      return user.role.name;
    }
    
    // Tương thích ngược với cấu trúc cũ (nếu cần)
    if (user.roles && user.roles.length > 0) {
      return user.roles[0];
    }
    
    return null;
  }

  /**
   * Đăng nhập với tên đăng nhập/email và mật khẩu
   */
  login(credentials: { email: string; password: string; rememberMe?: boolean }): Observable<any> {
    return this.http.post<any>(AUTH_API.LOGIN, credentials).pipe(
      map(response => {
        if (response && response.success && response.data) {
          const { user, token } = response.data;
          
          if (token) {
            this.saveToken(token);
          }
          
          if (user) {
            this.currentUserSubject.next(user);
            this.storageService.setLocalItem(USER_INFO_KEY, user);
            this.isLoggedInSubject.next(true);
          }
          
          this.router.navigate(['/dashboard']);
          return response.data;
        }
         
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Đăng ký tài khoản mới
   */
  register(userInfo: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userInfo).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Đăng xuất khỏi hệ thống
   */
  logout(): void {
    // Tùy chọn: gửi request đến server để vô hiệu hóa token
    this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      catchError(() => of(null))
    ).subscribe();
    
    this.removeToken();
    this.storageService.removeLocalItem(USER_INFO_KEY);
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Lưu token xác thực
   */
  saveToken(token: string): void {
    this.storageService.setLocalItem(AUTH_TOKEN_KEY, token);
  }

  /**
   * Lấy token xác thực từ storage
   */
  getToken(): string | null {
    return this.storageService.getLocalItem<string>(AUTH_TOKEN_KEY);
  }

  /**
   * Xóa token xác thực
   */
  removeToken(): void {
    this.storageService.removeLocalItem(AUTH_TOKEN_KEY);
  }

  /**
   * Giải mã token hoặc gọi API để lấy thông tin người dùng
   */
  loadUserFromToken(): void {
    const token = this.getToken();
    const cachedUser = this.storageService.getLocalItem<User>(USER_INFO_KEY);
    
    if (!token) {
      this.isLoggedInSubject.next(false);
      this.currentUserSubject.next(null);
      return;
    }
    
    if (cachedUser) {
      // Sử dụng thông tin người dùng từ cache
      this.currentUserSubject.next(cachedUser);
      this.isLoggedInSubject.next(true);
      return;
    }
    
    // Gọi API để lấy thông tin người dùng dựa trên token
    this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.storageService.setLocalItem(USER_INFO_KEY, user);
        this.isLoggedInSubject.next(true);
      }),
      catchError(error => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        this.isLoggedInSubject.next(false);
        this.currentUserSubject.next(null);
        this.removeToken();
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Kiểm tra xem người dùng có vai trò (role) được yêu cầu hay không
   */
  hasRole(expectedRole: string | string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    // Kiểm tra role trong cấu trúc API mới
    if (user.role && user.role.name) {
      if (Array.isArray(expectedRole)) {
        return expectedRole.includes(user.role.name);
      }
      return user.role.name === expectedRole;
    }
    
    // Tương thích ngược với cấu trúc cũ
    if (user.roles && user.roles.length > 0) {
      if (Array.isArray(expectedRole)) {
        return expectedRole.some(role => user.roles?.includes(role));
      }
      return user.roles.includes(expectedRole);
    }
    
    return false;
  }

  /**
   * Xử lý lỗi từ HTTP requests
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Đã xảy ra lỗi không xác định';
    
    if (error.error instanceof ErrorEvent) {
      // Lỗi phía client
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Lỗi từ backend
      errorMessage = error.error?.message || `Mã lỗi: ${error.status}, Thông báo: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  refreshToken(): Observable<string> {
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, {}).pipe(
      map(response => {
        const token = response?.data?.token;
        if (token) {
          this.saveToken(token);
        }
        return token;
      }),
      catchError(error => {
        this.logout();
        return throwError(() => new Error('Không thể làm mới token'));
      })
    );
  }



}


//refresh token

