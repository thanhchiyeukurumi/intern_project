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
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {
    // Kiểm tra trạng thái đăng nhập khi khởi tạo service
    this.loadUserFromToken();
  }

  // ============================================
  // KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP - isLoggedIn
  // ============================================
  /**
   * Kiểm tra trạng thái đăng nhập
   * @returns boolean - Trạng thái đăng nhập
   */
  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  // ============================================
  // LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI - getCurrentUser
  // ============================================
  /**
   * Lấy thông tin người dùng hiện tại
   * @returns User | null - Thông tin người dùng hiện tại hoặc null nếu chưa đăng nhập
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // ============================================
  // LẤY VAI TRÒ CỦA NGƯỜI DÙNG HIỆN TẠI - getRole
  // ============================================
  /**
   * Lấy role của người dùng hiện tại
   * @returns string | null - Role của người dùng hiện tại hoặc null nếu chưa đăng nhập
   */
  getRole(): string | null {
    const user = this.currentUserSubject.value;
    if (!user) return null;
    if (user.role && user.role.name) {
      return user.role.name;
    }  
    return null;
  }

  // ============================================
  // ĐĂNG NHẬP - login
  // ============================================
  /**
   * Đăng nhập với tên đăng nhập/email và mật khẩu
   * @param credentials - Thông tin đăng nhập
   * @returns Observable - Dữ liệu đăng nhập
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

  // ============================================
  // ĐĂNG KÝ - register
  // ============================================
  /**
   * Đăng ký tài khoản mới
   * @param userInfo - Thông tin đăng ký
   * @returns Observable - Dữ liệu đăng ký
   */
  register(userInfo: { username: string; fullname: string; email: string; password: string}): Observable<any> {
    return this.http.post<any>(AUTH_API.REGISTER, userInfo).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================
  // ĐĂNG XUẤT - logout
  // ============================================
  /**
   * Đăng xuất khỏi hệ thống
   */
  logout(): void {
    // Tùy chọn: gửi request đến server để vô hiệu hóa token
    this.http.post(`${AUTH_API.LOGOUT}`, {}).pipe(
      catchError(() => of(null))
    ).subscribe();
    
    this.removeToken();
    this.storageService.removeLocalItem(USER_INFO_KEY);
    this.storageService.clearLocalStorage();
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  // ============================================
  // LƯU TOKEN XÁC THỰC - saveToken
  // ============================================
  /**
   * Lưu token xác thực
   */
  saveToken(token: string): void {
    this.storageService.setLocalItem(AUTH_TOKEN_KEY, token);
  }

  // ============================================
  // LẤY TOKEN XÁC THỰC - getToken
  // ============================================
  /**
   * Lấy token xác thực từ storage
   */
  getToken(): string | null {
    return this.storageService.getLocalItem<string>(AUTH_TOKEN_KEY);
  }

  // ============================================
  // XÓA TOKEN XÁC THỰC - removeToken
  // ============================================
  /**
   * Xóa token xác thực
   */
  removeToken(): void {
    this.storageService.removeLocalItem(AUTH_TOKEN_KEY);
  }

  // ============================================
  // GIẢI MÃ TOKEN HOẶC GỌI API ĐỂ LẤY THÔNG TIN NGƯỜI DÙNG - loadUserFromToken
  // ============================================
  /**
   * Giải mã token hoặc gọi API để lấy thông tin người dùng.
   * Nhung ma hien tai dang luu thong tin nguoi dung trong localstorage nen khong biet co can thiet hay khong
   * @returns void
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
      this.currentUserSubject.next(cachedUser);
      this.isLoggedInSubject.next(true);
      return;
    }
    
    // Gọi API để lấy thông tin người dùng dựa trên token
    this.http.get<User>(`${AUTH_API.ME}`).pipe(
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

  // ============================================
  // KIỂM TRA VAI TRÒ CỦA NGƯỜI DÙNG - hasRole
  // ============================================
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
    
    return false;
  }

  // ============================================
  // XỬ LÝ LỖI TỪ HTTP REQUESTS - handleError
  // ============================================
  /**
   * Xử lý lỗi từ HTTP requests
   * @param error - Lỗi từ HTTP requests
   * @returns Observable - Lỗi từ HTTP requests
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

  // ============================================
  // LÀM MỚI TOKEN - refreshToken
  // ============================================
  /**
   * Làm mới token
   * @returns Observable - Dữ liệu token mới
   */
  refreshToken(): Observable<string> {
    return this.http.post<any>(`${AUTH_API.REFRESH_TOKEN}`, {}).pipe(
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

  // ============================================
  // CẬP NHẬT THÔNG TIN NGƯỜI DÙNG HIỆN TẠI - updateCurrentUser
  // ============================================
  /**
   * Cập nhật thông tin người dùng hiện tại trong AuthService
   * @param user - Thông tin người dùng đã cập nhật
   */
  updateCurrentUser(user: User | any): void {
    // Đảm bảo chỉ lưu đối tượng User, không phải toàn bộ response API
    let userData: User;
    
    if (user && 'data' in user && user.data) {
      // Trường hợp user là response API có dạng { data: User, ... }
      userData = user.data;
      console.log('Extracted user from response data', userData);
    } else {
      // Trường hợp user đã được trích xuất
      userData = user as User;
      console.log('Using provided user directly', userData);
    }
    
    // Cập nhật BehaviorSubject và localStorage
    this.currentUserSubject.next(userData);
    this.storageService.setLocalItem(USER_INFO_KEY, userData);
  }
}