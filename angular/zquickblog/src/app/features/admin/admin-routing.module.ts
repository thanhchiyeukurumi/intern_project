import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './containers/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './containers/admin-dashboard/admin-dashboard.component';
import { AdminSettingComponent } from './containers/admin-setting/admin-setting.component';
import { AdminPostComponent } from './containers/admin-post/admin-post.component';
import { AdminUserComponent } from './containers/admin-user/admin-user.component';
import { AdminCategoryComponent } from './containers/admin-category/admin-category.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      // Trang tổng quan
      { path: 'dashboard', component: AdminDashboardComponent },
      
      // Quản lý nội dung
      { path: 'posts', component: AdminPostComponent },
      { path: 'categories', component: AdminCategoryComponent },
      
      // Quản lý người dùng và cài đặt
      { path: 'users', component: AdminUserComponent },
      { path: 'settings', component: AdminSettingComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }