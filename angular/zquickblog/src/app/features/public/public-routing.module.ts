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
      
      // Xác thực
      {
        path: 'auth',
        children: [
          { path: '', redirectTo: 'login', pathMatch: 'full' },
          { path: 'login', component: LoginComponent },
          { path: 'register', component: RegisterComponent }
        ]
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }