import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import Layout Component
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';

// Import các Page/Container Components
import { HomePageComponent } from './containers/home-page/home-page.component';
import { BlogDetailComponent } from './containers/blog-detail/blog-detail.component';
import { PostDetailComponent } from './containers/post-detail/post-detail.component';
import { AllCategoriesComponent } from './containers/all-categories/all-categories.component';
import { CategoryDetailComponent } from './containers/category-detail/category-detail.component';
import { LoginComponent } from './containers/login/login.component';
import { RegisterComponent } from './containers/register/register.component';
import { HomeDetailComponent } from './containers/home-detail/home-detail.component';
import { BloggerDetailComponent } from './containers/blogger-detail/blogger-detail.component';

// Import Route Guard
import { PublicAuthGuard } from '../../core/guards/public-auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      // Trang chủ và trang bài viết chính
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeDetailComponent },
      { path: 'blogs', component: HomePageComponent },
      
      // Bài viết chi tiết
      { path: 'post/:id', component: PostDetailComponent },
      
      // Danh mục
      { path: 'categories', component: AllCategoriesComponent },
      { path: 'categories/:id', component: CategoryDetailComponent },
      
      // Người dùng/Blogger
      { path: 'blogger/:id', component: BloggerDetailComponent },
      
      // Xác thực - áp dụng guard
      { path: 'login', component: LoginComponent, canActivate: [PublicAuthGuard] },
      { path: 'register', component: RegisterComponent, canActivate: [PublicAuthGuard] },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }