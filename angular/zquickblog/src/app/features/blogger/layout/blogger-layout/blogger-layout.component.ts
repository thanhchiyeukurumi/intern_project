import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../shared/models/user.model';
import { Subscription } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-blogger-layout',
  templateUrl: './blogger-layout.component.html',
  styleUrls: ['./blogger-layout.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzDropDownModule,
    NzAvatarModule,
    NzButtonModule,
    NzToolTipModule
  ]
})
export class BloggerLayoutComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isDarkMode = false;
  
  username = '';
  fullname = '';
  avatarUrl = '';
  currentUser: User | null = null;
  private subscriptions = new Subscription();
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private message: NzMessageService
  ) {
    // Check for saved theme preference
    this.isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  }
  
  ngOnInit(): void {
    this.loadUserInfo();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  loadUserInfo(): void {
    // Lấy thông tin user từ AuthService
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      this.updateUserInfo(this.currentUser);
    } else {
      // Nếu chưa có dữ liệu user, lấy từ token hoặc localStorage
      this.authService.loadUserFromToken();
      
      // Đăng ký theo dõi currentUser$ Observable
      const userSub = this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.updateUserInfo(user);
        } else {
          // Nếu không có thông tin người dùng, chuyển hướng về trang login
          this.router.navigate(['/login']);
        }
      });
      
      this.subscriptions.add(userSub);
    }
  }
  
  updateUserInfo(user: User): void {
    this.username = user.username || '';
    this.fullname = user.fullname || '';
    this.avatarUrl = user.avatar || 'assets/images/default-avatar.png';
  }
  
  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }
  
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
  }
  
  logout(): void {
    // Gọi phương thức logout từ AuthService
    this.authService.logout();
    this.message.success('Đăng xuất thành công');
  }
}