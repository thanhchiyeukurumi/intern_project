import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router'; // Thêm Router
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzAvatarModule } from 'ng-zorro-antd/avatar'; // Import NzAvatarModule
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'; // Import NzDropDownModule
import { NzDividerModule } from 'ng-zorro-antd/divider'; // Import NzDividerModule

import { AuthService } from '../../../../core/services/auth.service'; // Import AuthService
import { User } from '../../../../shared/models/user.model'; // Import User model
import { Subscription } from 'rxjs'; // Import Subscription

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzButtonModule,
    NzIconModule,
    NzDrawerModule,
    NzAvatarModule,
    NzDropDownModule,
    NzDividerModule
  ],
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.css']
})
export class PublicLayoutComponent implements OnInit, OnDestroy {
  isMobileMenuVisible = false; // Trạng thái hiển thị menu mobile
  isLoggedIn = false;
  currentUser: User | null = null;
  
  private authSubscription: Subscription | null = null;
  private userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Đăng ký theo dõi trạng thái đăng nhập
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
      }
    );

    // Đăng ký theo dõi thông tin người dùng hiện tại
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
      }
    );
  }

  ngOnDestroy(): void {
    // Hủy đăng ký để tránh memory leak
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Hàm đóng menu mobile (ví dụ khi click vào link)
  closeMobileMenu(): void {
    this.isMobileMenuVisible = false;
  }

  // Hàm kiểm tra vai trò người dùng
  hasRole(expectedRole: string | string[]): boolean {
    return this.authService.hasRole(expectedRole);
  }

  // Hàm đăng xuất
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}