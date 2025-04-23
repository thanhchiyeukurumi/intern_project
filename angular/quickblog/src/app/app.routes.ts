import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { bloggerGuard } from './core/guards/blogger.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/home', 
    pathMatch: 'full' 
  },
  {
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(c => c.RegisterComponent)
  },
  { 
    path: 'home', 
    loadComponent: () => import('./features/home/home.component').then(c => c.HomeComponent)
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./features/profile/profile.component').then(c => c.ProfileComponent),
    canActivate: [authGuard] // Chỉ cho phép người dùng đã đăng nhập
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./features/admin/admin.routes').then(r => r.ADMIN_ROUTES),
    canActivate: [adminGuard] // Chỉ cho phép admin
  },
  { 
    path: 'blog', 
    loadChildren: () => import('./features/blog/blog.routes').then(r => r.BLOG_ROUTES),
    canMatch: [authGuard] // Phải đăng nhập mới xem blog
  },
  {
    path: 'create-post',
    loadComponent: () => import('./features/blog/create-post/create-post.component').then(c => c.CreatePostComponent),
    canActivate: [bloggerGuard] // Chỉ blogger hoặc admin có thể tạo bài viết
  },
  { 
    path: 'forbidden', 
    loadComponent: () => import('./shared/components/forbidden/forbidden.component').then(c => c.ForbiddenComponent)
  },
  { 
    path: '**', 
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(c => c.NotFoundComponent)
  }
];
