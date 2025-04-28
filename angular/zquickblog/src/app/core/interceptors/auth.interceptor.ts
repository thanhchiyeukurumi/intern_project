import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  let modifiedReq = req;

  // 1. Thêm token vào header (nếu có)
  if (token) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. Xử lý response, bắt lỗi
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Bắt lỗi 401 Unauthorized
      if (error.status === 401) {
        // Kiểm tra xem request này có phải là request refresh token không
        // (Để tránh vòng lặp vô hạn nếu request refresh token cũng trả về 401)
        // Cần một cách để đánh dấu request refresh token, ví dụ: thêm header tùy chỉnh
        // Hoặc kiểm tra URL của request
        if (req.url.includes('/api/auth/refresh-token')) { // Điều chỉnh URL endpoint refresh token của bạn
            // Nếu chính request refresh token bị lỗi 401, đăng xuất người dùng
            authService.logout();
            return throwError(() => new Error('Refresh token failed. Please log in again.'));
        }

        // Token hết hạn, thử refresh token
        // Sử dụng switchMap để chuyển từ Observable lỗi sang Observable refresh token, sau đó retry request ban đầu
        return authService.refreshToken().pipe(
          switchMap((newToken: string | null) => {
            if (newToken) {
              // Refresh token thành công, lưu token mới (đã được xử lý trong authService.refreshToken)
              // Clone request ban đầu với token MỚI
              const newModifiedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              // Thử gửi lại request ban đầu với token mới
              return next(newModifiedReq);
            } else {
              // Refresh token thất bại (refreshToken() đã xử lý logout)
              return throwError(() => new Error('Token expired. Please log in again.'));
            }
          }),
          catchError((refreshError) => {
             // Xảy ra lỗi trong quá trình refresh token (ví dụ: refresh token cũng hết hạn)
             // AuthService.refreshToken() nên xử lý logout trong trường hợp này
             return throwError(() => new Error('Session expired. Please log in again.'));
          })
        );
      }

      // Đối với các lỗi khác (không phải 401), ném lỗi gốc đi tiếp
      return throwError(() => error);
    })
  );
};

// Cần cung cấp Interceptor này trong app.config.ts
// import { provideHttpClient, withInterceptors } from '@angular/common/http';
// ... trong providers của appConfig ...
// provideHttpClient(withInterceptors([authInterceptor]))