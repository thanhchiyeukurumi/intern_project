import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PublicAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Kiểm tra nếu người dùng đã đăng nhập
    if (this.authService.isLoggedIn()) {
      // Đã đăng nhập, chuyển hướng đến trang chủ
      return this.router.createUrlTree(['/home']);
    }
    
    // Chưa đăng nhập, cho phép truy cập các trang như đăng nhập, đăng ký
    return true;
  }
} 