import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './containers/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './containers/admin-dashboard/admin-dashboard.component';
import { AdminSettingComponent } from './containers/admin-setting/admin-setting.component';
import { AdminPostComponent } from './containers/admin-post/admin-post.component';
import { AdminUserComponent } from './containers/admin-user/admin-user.component';
import { AdminCategoryComponent } from './containers/admin-category/admin-category.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminRoutingModule,
    AdminLayoutComponent,
    AdminDashboardComponent,
    AdminSettingComponent,
    AdminPostComponent,
    AdminUserComponent,
    AdminCategoryComponent
  ]
})
export class AdminModule { }