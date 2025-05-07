import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { PostService } from '../../../../core/services/post.service';
import { UserService } from '../../../../core/services/user.service';
import { CommentService } from '../../../../core/services/comment.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzIconModule,
    BaseChartDirective
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Dữ liệu thống kê
  totalPosts: number = 0;
  totalUsers: number = 0;
  totalComments: number = 0;
  totalViews: number = 0;
  
  // Dữ liệu tăng trưởng
  postGrowth: number = 0;
  userGrowth: number = 0;
  commentGrowth: number = 0;
  viewGrowth: number = 0;
  
  // Cấu hình biểu đồ bài viết theo tháng
  public postsChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Số bài viết',
        fill: false,
        tension: 0.5,
        borderColor: 'rgba(77,189,116,.8)',
        backgroundColor: 'rgba(77,189,116,.3)'
      }
    ]
  };
  
  public postsChartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: true,
      }
    }
  };
  
  // Cấu hình biểu đồ người dùng theo tháng
  public usersChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Người dùng mới',
        fill: false,
        tension: 0.5,
        borderColor: 'rgba(54,185,204,.8)',
        backgroundColor: 'rgba(54,185,204,.3)'
      }
    ]
  };
  
  public usersChartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          stepSize: 5
        }
      }
    },
    plugins: {
      legend: {
        display: true,
      }
    }
  };
  
  // Cấu hình biểu đồ pie cho phân bố bài viết theo danh mục
  public categoryChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Công nghệ', 'Kinh doanh', 'Đời sống', 'Du lịch', 'Khác'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        hoverBackgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ]
      }
    ]
  };
  
  public categoryChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };
  
  constructor(
    private postService: PostService,
    private userService: UserService,
    private commentService: CommentService
  ) { }
  
  ngOnInit(): void {
    this.loadDashboardData();
    this.generateMockChartData();
  }
  
  loadDashboardData(): void {
    // Sử dụng forkJoin để gọi đồng thời nhiều API
    forkJoin({
      posts: this.postService.getAll({ limit: 1, page: 1 }),
      users: this.userService.getAll({ limit: 1, page: 1, includeRelations: true })
    }).subscribe({
      next: (results) => {
        if (results.posts && results.posts.pagination) {
          this.totalPosts = results.posts.pagination.totalItems || 0;
          this.postGrowth = 12.0; // Giá trị tạm thời, có thể thay bằng dữ liệu thực từ API
        }
        
        if (results.users && results.users.pagination) {
          this.totalUsers = results.users.pagination.totalItems || 0;
          this.userGrowth = 5.3; // Giá trị tạm thời
        }
        
        // Hiện tại chưa có API để lấy tổng số lượt xem và bình luận
        // nên sử dụng giá trị mẫu tạm thời
        this.totalComments = 328;
        this.commentGrowth = 8.1;
        
        this.totalViews = 25400;
        this.viewGrowth = 15.6;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }
  
  // Tạo dữ liệu mẫu cho biểu đồ - trong thực tế sẽ thay bằng dữ liệu từ API
  generateMockChartData(): void {
    // Tạo nhãn cho 12 tháng
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    
    // Dữ liệu mẫu cho số bài viết theo tháng
    const postCountByMonth = [5, 8, 12, 10, 15, 18, 20, 25, 22, 28, 32, 35];
    
    // Dữ liệu mẫu cho số người dùng mới theo tháng
    const userCountByMonth = [10, 15, 20, 25, 30, 35, 45, 50, 55, 60, 70, 80];
    
    // Cập nhật dữ liệu biểu đồ
    this.postsChartData.labels = months;
    this.postsChartData.datasets[0].data = postCountByMonth;
    
    this.usersChartData.labels = months;
    this.usersChartData.datasets[0].data = userCountByMonth;
  }
}
