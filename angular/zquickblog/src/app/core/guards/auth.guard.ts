import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard kiểm tra người dùng đã đăng nhập chưa
 * Nếu chưa đăng nhập, điều hướng về trang login
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  // Lưu URL hiện tại để có thể redirect sau khi đăng nhập
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
