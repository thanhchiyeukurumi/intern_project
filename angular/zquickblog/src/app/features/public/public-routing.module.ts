import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import Layout Component
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component'; // <-- Đảm bảo đường dẫn đúng

// Import các Page/Container Components (Giả sử chúng là standalone)
import { HomePageComponent } from './containers/home-page/home-page.component';
import { BlogDetailComponent } from './containers/blog-detail/blog-detail.component';
import { PostDetailComponent } from './containers/post-detail/post-detail.component';
import { AllCategoriesComponent } from './containers/all-categories/all-categories.component';
import { CategoryDetailComponent } from './containers/category-detail/category-detail.component';
import { LoginComponent } from './containers/login/login.component';
import { RegisterComponent } from './containers/register/register.component';
import { HomeDetailComponent } from './containers/home-detail/home-detail.component';

// --- Lưu ý: Bạn cần đảm bảo các component trên đã được tạo và là standalone ---
// Ví dụ: HomePageComponent phải có standalone: true trong decorator @Component

const routes: Routes = [
  {
    path: '', // Route gốc cho phần public, sẽ load layout
    component: PublicLayoutComponent, // Load layout chung
    children: [
      // Các route con sẽ được hiển thị bên trong <router-outlet> của PublicLayoutComponent
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirect từ path rỗng ('/') sang 'home'
      {
        path: 'home', // Path: '/home'
        component: HomePageComponent
      },
      {
        path: 'all',
        component: HomeDetailComponent
      },
      {
        path: 'post/:id', // Path: '/post/123'
        component: PostDetailComponent
      },
      {
        path: 'categories', // Path: '/categories'
        component: AllCategoriesComponent
      },
      {
        path: 'category/:id', // Path: '/category/tech'
        component: CategoryDetailComponent
      },
      // Giữ nguyên cấu trúc /auth nếu muốn login/register vẫn nằm trong layout chung
      {
        path: 'auth', // Path: '/auth'
        children: [
          // Redirect nếu vào /auth mà không có gì
           { path: '', redirectTo: 'login', pathMatch: 'full' },
          {
            path: 'login', // Path: '/auth/login'
            component: LoginComponent
          },
          {
            path: 'register', // Path: '/auth/register'
            component: RegisterComponent
          }
        ]
      },
    ]
  },
  // --- Cân nhắc: Nếu login/register KHÔNG nên có header/footer chung ---
  // thì bỏ chúng ra khỏi children của PublicLayoutComponent và đặt thành route riêng ở đây:
  // {
  //   path: 'auth',
  //   children: [
  //      { path: '', redirectTo: 'login', pathMatch: 'full' },
  //      { path: 'login', component: LoginComponent },
  //      { path: 'register', component: RegisterComponent }
  //   ]
  // },
  // --- Có thể thêm route wildcard (**) ở app-routing.module.ts để bắt các route không khớp ---
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }