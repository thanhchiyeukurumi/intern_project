import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router'; // Import RouterModule và RouterOutlet
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule } from 'ng-zorro-antd/drawer'; // Import NzDrawerModule

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Thêm RouterModule
    RouterOutlet, // Thêm RouterOutlet
    NzLayoutModule,
    NzMenuModule,
    NzButtonModule,
    NzIconModule,
    NzDrawerModule // Thêm NzDrawerModule
  ],
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.css']
})
export class PublicLayoutComponent {
  isMobileMenuVisible = false; // Trạng thái hiển thị menu mobile

  // Hàm đóng menu mobile (ví dụ khi click vào link)
  closeMobileMenu(): void {
    this.isMobileMenuVisible = false;
  }
}