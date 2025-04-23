import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor thêm JWT token vào header Authorization cho các HTTP request
 * nếu người dùng đã đăng nhập
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token) {
    // Clone request và thêm Authorization header
    const modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Gửi request đã được sửa đổi
    return next(modifiedReq);
  }
  
  // Nếu không có token, gửi request gốc
  return next(req);
};
