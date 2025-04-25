import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule cho routerLink
import { NzButtonModule } from 'ng-zorro-antd/button'; // Import NzButtonModule

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Thêm RouterModule vào imports
    NzButtonModule // Thêm NzButtonModule vào imports
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {
  // Hiện tại chưa cần logic gì đặc biệt cho trang chủ tĩnh này
}