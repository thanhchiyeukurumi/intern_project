import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzAvatarModule,
    NzDropDownModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  isCollapsed = false;
  currentUser: User | null = null;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Lấy thông tin người dùng hiện tại từ AuthService
    this.currentUser = this.authService.getCurrentUser();
    
    // Đăng ký lắng nghe thay đổi người dùng
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }
  
  // Hàm lấy avatar của người dùng với fallback
  getUserAvatar(): string {
    return this.currentUser?.avatar || '';
  }
  
  // Hàm lấy tên hiển thị của người dùng
  getUserDisplayName(): string {
    return this.currentUser?.fullname || this.currentUser?.username || 'Admin User';
  }
  
  // Hàm đăng xuất
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}