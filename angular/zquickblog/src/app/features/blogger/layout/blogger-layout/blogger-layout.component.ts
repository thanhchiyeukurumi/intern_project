import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

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
export class BloggerLayoutComponent {
  isCollapsed = false;
  isDarkMode = false;
  
  username = 'thanhthikalyce';
  avatarUrl = 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256';
  
  constructor() {
    // Check for saved theme preference
    this.isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  }
  
  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }
  
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
  }
  
  logout(): void {
    // Implement logout functionality
    console.log('Logging out...');
  }
}