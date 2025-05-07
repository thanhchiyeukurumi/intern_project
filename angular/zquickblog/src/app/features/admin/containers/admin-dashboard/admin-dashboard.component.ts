import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { PostService } from '../../../../core/services/post.service';
import { UserService } from '../../../../core/services/user.service';
import { CommentService } from '../../../../core/services/comment.service';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzIconModule,
    NzRadioModule,
    BaseChartDirective
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Biến chọn ngày
  selectedDateRange: number = 30; // Mặc định 30 ngày
  dateRangeOptions = [
    { label: '7 ngày', value: 7 },
    { label: '30 ngày', value: 30 },
    { label: '90 ngày', value: 90 },
    { label: '180 ngày', value: 180 },
    { label: '365 ngày', value: 365 },
  ];
  
  // Các biến trạng thái
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  
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
  }
  
  // Hàm xử lý khi thay đổi khoảng thời gian
  onDateRangeChange(): void {
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;
    
    // Lấy ngày hiện tại
    const today = new Date();
    
    // Tính ngày bắt đầu dựa trên khoảng thời gian đã chọn
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - this.selectedDateRange);
    
    // Tham số API có thể được thêm vào sau khi API hỗ trợ khoảng thời gian
    const params = { 
      startDate: startDate.toISOString(),
      endDate: today.toISOString()
    };
    
    // Sử dụng forkJoin để gọi đồng thời nhiều API
    forkJoin({
      posts: this.postService.getAll({ limit: 1000, page: 1 }).pipe(
        catchError(error => {
          console.error('Error loading posts:', error);
          return of({ data: [], pagination: { totalItems: 0 } });
        })
      ),
      users: this.userService.getAll({ limit: 1, page: 1, includeRelations: true }).pipe(
        catchError(error => {
          console.error('Error loading users:', error);
          return of({ data: [], pagination: { totalItems: 0 } });
        })
      )
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.generateChartData();
      })
    ).subscribe({
      next: (results) => {
        if (results.posts && results.posts.pagination) {
          this.totalPosts = results.posts.pagination.totalItems || 0;
          // Tính toán sự tăng trưởng dựa trên dữ liệu nếu có
          this.postGrowth = 12.0; 
        }
        
        if (results.users && results.users.pagination) {
          this.totalUsers = results.users.pagination.totalItems || 0;
          this.userGrowth = 5.3;
        }
        
        // Trong thực tế, sẽ cần thêm API để lấy comment stats và view stats
        // Hiện tại, sử dụng dữ liệu giả lập
        this.calculateMockStatsData();
      },
      error: (error) => {
        this.hasError = true;
        this.errorMessage = 'Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.';
        console.error('Error loading dashboard data:', error);
      }
    });
  }
  
  // Tính toán dữ liệu mẫu cho comment và view
  calculateMockStatsData(): void {
    // Mẫu dữ liệu cho comments dựa trên totalPosts
    this.totalComments = Math.round(this.totalPosts * 2.5);
    this.commentGrowth = 8.1;
    
    // Mẫu dữ liệu cho views dựa trên totalPosts và totalUsers
    this.totalViews = Math.round((this.totalPosts * 50) + (this.totalUsers * 10));
    this.viewGrowth = 15.6;
  }
  
  // Tạo dữ liệu cho biểu đồ dựa trên khoảng thời gian đã chọn
  generateChartData(): void {
    // 1. Tính toán nhãn ngày/tháng dựa trên khoảng thời gian đã chọn
    const labels = this.generateDateLabels();
    
    // 2. Tạo dữ liệu mẫu cho biểu đồ bài viết
    const postData = this.generateMockPostData(labels.length);
    
    // 3. Tạo dữ liệu mẫu cho biểu đồ người dùng
    const userData = this.generateMockUserData(labels.length);
    
    // 4. Cập nhật dữ liệu biểu đồ
    this.postsChartData.labels = labels;
    this.postsChartData.datasets[0].data = postData;
    
    this.usersChartData.labels = labels;
    this.usersChartData.datasets[0].data = userData;
  }
  
  // Tạo nhãn ngày/tháng dựa trên khoảng thời gian đã chọn
  generateDateLabels(): string[] {
    const labels: string[] = [];
    const today = new Date();
    
    // Xác định số lượng điểm dữ liệu và định dạng
    let numPoints: number;
    let isMonthFormat = false;
    
    if (this.selectedDateRange <= 30) {
      // Hiển thị theo ngày nếu ≤ 30 ngày
      numPoints = this.selectedDateRange;
    } else if (this.selectedDateRange <= 90) {
      // Hiển thị mỗi 3 ngày nếu ≤ 90 ngày
      numPoints = Math.ceil(this.selectedDateRange / 3);
    } else {
      // Hiển thị theo tháng nếu > 90 ngày
      numPoints = Math.ceil(this.selectedDateRange / 30);
      isMonthFormat = true;
    }
    
    // Tạo nhãn ngày/tháng
    for (let i = numPoints - 1; i >= 0; i--) {
      const date = new Date(today);
      
      if (isMonthFormat) {
        // Lùi theo tháng
        date.setMonth(date.getMonth() - i);
        labels.push(`Tháng ${date.getMonth() + 1}`);
      } else {
        // Lùi theo ngày
        const step = this.selectedDateRange <= 30 ? 1 : 3;
        date.setDate(date.getDate() - (i * step));
        labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
      }
    }
    
    return labels;
  }
  
  // Tạo dữ liệu mẫu cho biểu đồ bài viết
  generateMockPostData(numPoints: number): number[] {
    // Dựa trên tổng số bài viết, tạo dữ liệu phân bổ
    const postData: number[] = [];
    const baseValue = Math.max(1, Math.floor(this.totalPosts / numPoints / 2));
    
    for (let i = 0; i < numPoints; i++) {
      // Tạo xu hướng tăng dần
      const value = baseValue + Math.floor(baseValue * (i / numPoints) * 3 * (0.5 + Math.random()));
      postData.push(value);
    }
    
    return postData;
  }
  
  // Tạo dữ liệu mẫu cho biểu đồ người dùng
  generateMockUserData(numPoints: number): number[] {
    // Dựa trên tổng số người dùng, tạo dữ liệu phân bổ
    const userData: number[] = [];
    const baseValue = Math.max(1, Math.floor(this.totalUsers / numPoints / 3));
    
    for (let i = 0; i < numPoints; i++) {
      // Tạo xu hướng tăng dần với một số dao động
      const value = baseValue + Math.floor(baseValue * (i / numPoints) * 4 * (0.6 + Math.random()));
      userData.push(value);
    }
    
    return userData;
  }
}
