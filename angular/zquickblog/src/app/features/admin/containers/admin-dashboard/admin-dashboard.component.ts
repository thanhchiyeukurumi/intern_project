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
    labels: [],
    datasets: [
      {
        data: [],
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
    
    // Xác định groupBy dựa trên khoảng thời gian đã chọn
    let groupBy: 'day' | 'week' | 'month' = 'day';
    if (this.selectedDateRange > 90) {
      groupBy = 'month';
    } else if (this.selectedDateRange > 30) {
      groupBy = 'week';
    }
    
    const params = {
      startDate: this.getStartDateFromRange(this.selectedDateRange),
      groupBy: groupBy
    };
    console.log('Calling API with params:', params);

    this.postService.getPostStats(params).pipe(
      catchError(error => {
        console.error('Error loading dashboard stats:', error);
        this.hasError = true;
        this.errorMessage = 'Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.';
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(response => {
      console.log('API response:', response);
      // Kiểm tra response và response.data
      if (response && response.data) {
        const data = response.data; // Truy cập data từ response

        // Cập nhật thống kê tổng quát
        this.totalPosts = data.total || 0;
        this.postGrowth = data.growth || 0;
        this.totalViews = data.views?.total || 0;
        this.viewGrowth = data.views?.growth || 0;
        
        // Cập nhật dữ liệu biểu đồ bài viết theo thời gian
        const timeLabels = data.timeData?.map((item: {date: string; count: number}) => 
          this.formatDateLabel(item.date, groupBy)) || [];
        const postCounts = data.timeData?.map((item: {date: string; count: number}) => 
          item.count) || [];
        
        this.postsChartData.labels = timeLabels;
        this.postsChartData.datasets[0].data = postCounts;
        console.log('Updated postsChartData:', this.postsChartData);
        
        // Cập nhật dữ liệu biểu đồ người dùng theo thời gian (giả lập)
        this.usersChartData.labels = timeLabels;
        this.usersChartData.datasets[0].data = this.generateMockUserData(timeLabels.length);
        console.log('Updated usersChartData:', this.usersChartData);
        
        // Cập nhật dữ liệu biểu đồ phân bố bài viết theo danh mục
        if (data.categories && data.categories.length > 0) {
          this.categoryChartData.labels = data.categories.map((cat: {id: number; name: string; count: string}) => cat.name);
          this.categoryChartData.datasets[0].data = data.categories.map((cat: {id: number; name: string; count: string}) => 
            parseInt(cat.count, 10)); // Chuyển count từ chuỗi sang số
        } else {
          this.generateMockCategoryData();
        }
        console.log('Updated categoryChartData:', this.categoryChartData);
      } else {
        console.log('Invalid or no data received, loading mock data');
        this.loadMockData();
      }
    });
  }
  
  // Định dạng nhãn ngày/tháng cho biểu đồ
  private formatDateLabel(dateStr: string, groupBy: 'day' | 'week' | 'month'): string {
    if (!dateStr) return '';
    
    const parts = dateStr.split('-');
    
    switch (groupBy) {
      case 'month':
        // Format: Tháng MM/YYYY
        return `Tháng ${parts[1]}/${parts[0]}`;
      case 'week':
        // Format: Tuần W, YYYY
        return `Tuần ${parts[1]}, ${parts[0]}`;
      default: // day
        // Format: DD/MM
        return `${parts[2]}/${parts[1]}`;
    }
  }
  
  // Tạo dữ liệu mẫu trong trường hợp không có dữ liệu thực
  private loadMockData(): void {
    // 1. Tính toán nhãn ngày/tháng dựa trên khoảng thời gian đã chọn
    const labels = this.generateMockDateLabels();
    
    // 2. Tạo dữ liệu mẫu cho biểu đồ bài viết
    const postData = this.generateMockPostData(labels.length);
    
    // 3. Tạo dữ liệu mẫu cho biểu đồ người dùng
    const userData = this.generateMockUserData(labels.length);
    
    // 4. Cập nhật dữ liệu biểu đồ
    this.postsChartData.labels = labels;
    this.postsChartData.datasets[0].data = postData;
    
    this.usersChartData.labels = labels;
    this.usersChartData.datasets[0].data = userData;
    
    // 5. Tạo dữ liệu mẫu cho biểu đồ danh mục
    this.generateMockCategoryData();
    
    // 6. Cập nhật số liệu tổng quát
    this.totalPosts = postData.reduce((sum, value) => sum + value, 0);
    this.totalUsers = 100;
    this.totalComments = Math.round(this.totalPosts * 2.5);
    this.totalViews = Math.round(this.totalPosts * 50);
    
    // 7. Cập nhật tỷ lệ tăng trưởng
    this.postGrowth = 12.0;
    this.userGrowth = 5.3;
    this.commentGrowth = 8.1;
    this.viewGrowth = 15.6;
  }
  
  // Tạo dữ liệu phân loại danh mục
  private generateMockCategoryData(): void {
    this.categoryChartData.labels = ['Công nghệ', 'Kinh doanh', 'Đời sống', 'Du lịch', 'Khác'];
    this.categoryChartData.datasets[0].data = [30, 25, 20, 15, 10];
  }
  
  // Tạo nhãn ngày/tháng dựa trên khoảng thời gian đã chọn
  private generateMockDateLabels(): string[] {
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
  private generateMockPostData(numPoints: number): number[] {
    // Dựa trên tổng số bài viết, tạo dữ liệu phân bổ
    const postData: number[] = [];
    const baseValue = Math.max(1, Math.floor(30 / numPoints / 2));
    
    for (let i = 0; i < numPoints; i++) {
      // Tạo xu hướng tăng dần
      const value = baseValue + Math.floor(baseValue * (i / numPoints) * 3 * (0.5 + Math.random()));
      postData.push(value);
    }
    
    return postData;
  }
  
  // Tạo dữ liệu mẫu cho biểu đồ người dùng
  private generateMockUserData(numPoints: number): number[] {
    // Dựa trên tổng số người dùng, tạo dữ liệu phân bổ
    const userData: number[] = [];
    const baseValue = Math.max(1, Math.floor(100 / numPoints / 3));
    
    for (let i = 0; i < numPoints; i++) {
      // Tạo xu hướng tăng dần với một số dao động
      const value = baseValue + Math.floor(baseValue * (i / numPoints) * 4 * (0.6 + Math.random()));
      userData.push(value);
    }
    
    return userData;
  }
  
  // Thêm phương thức mới để tính toán startDate từ khoảng thời gian
  private getStartDateFromRange(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0]; // Định dạng YYYY-MM-DD
  }
}