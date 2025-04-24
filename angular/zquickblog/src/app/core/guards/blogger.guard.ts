import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard kiểm tra người dùng có quyền Blogger
 * Yêu cầu người dùng đã đăng nhập và có role 'blogger'
 * Cho phép người dùng có role 'admin' vì admin thường có toàn quyền
 */
export const bloggerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && (authService.hasRole('blogger') || authService.hasRole('admin'))) {
    return true;
  }

  // Nếu đã đăng nhập nhưng không có quyền, điều hướng về trang truy cập bị từ chối
  if (authService.isLoggedIn()) {
    router.navigate(['/forbidden']);
    return false;
  }

  // Nếu chưa đăng nhập, điều hướng về trang login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
