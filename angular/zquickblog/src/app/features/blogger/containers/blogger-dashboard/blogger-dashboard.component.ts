import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

interface DashboardStats {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
}

@Component({
  selector: 'app-blogger-dashboard',
  templateUrl: './blogger-dashboard.component.html',
  styleUrls: ['./blogger-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzStatisticModule,
    NzIconModule,
    NzGridModule,
    NzSelectModule,
    NzTypographyModule
  ]
})
export class BloggerDashboardComponent implements OnInit {
  selectedTimeRange = '30d';
  
  timeRangeOptions = [
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
    { label: '90 days', value: '90d' },
    { label: 'All time', value: 'all' }
  ];
  
  stats: DashboardStats = {
    totalPosts: 12,
    totalViews: 4328,
    totalComments: 56
  };
  
  constructor() {}
  
  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    // In a real app, this would fetch data from an API
    console.log('Loading dashboard data for period:', this.selectedTimeRange);
  }
  
  onTimeRangeChange(value: string): void {
    this.selectedTimeRange = value;
    this.loadDashboardData();
  }
}