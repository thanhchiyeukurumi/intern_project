import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { AUTH_API } from '../constants/api-endpoints';

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
        if (req.url.includes('/auth/refresh-token')) {
            // Nếu chính request refresh token bị lỗi 401, đăng xuất người dùng
            authService.logout();
            return throwError(() => new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'));
        }
        
        // Kiểm tra nếu đây là request đăng nhập, không thực hiện refresh token
        if (req.url.includes('/auth/login')) {
            // Đây là lỗi đăng nhập thông thường, chỉ ném lỗi và không cố gắng refresh token
            return throwError(() => error);
        }

        // Token hết hạn, thử refresh token
        return authService.refreshToken().pipe(
          switchMap((newToken: string) => {
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
              return throwError(() => new Error('Token hết hạn. Vui lòng đăng nhập lại.'));
            }
          }),
          catchError((refreshError) => {
             // Xảy ra lỗi trong quá trình refresh token (ví dụ: refresh token cũng hết hạn)
             // AuthService.refreshToken() nên xử lý logout trong trường hợp này
             return throwError(() => new Error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.'));
          })
        );
      }

      // Đối với các lỗi khác (không phải 401), ném lỗi gốc đi tiếp
      return throwError(() => error);
    })
  );
};
