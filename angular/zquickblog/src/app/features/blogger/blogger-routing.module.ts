import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BloggerCommentsComponent } from './containers/blogger-comments/blogger-comments.component';
import { BloggerDashboardComponent } from './containers/blogger-dashboard/blogger-dashboard.component';
import { BloggerLayoutComponent } from './layout/blogger-layout/blogger-layout.component';
import { BloggerPostsComponent } from './containers/blogger-posts/blogger-posts.component';
import { BloggerSettingsComponent } from './containers/blogger-settings/blogger-settings.component';
import { BloggerProfileComponent } from './containers/blogger-profile/blogger-profile.component';
import { BloggerMediaComponent } from './containers/blogger-media/blogger-media.component';
import { BloggerPostCreateComponent } from './containers/blogger-post-create/blogger-post-create.component';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

// Guard để chỉ cho phép truy cập khi đang trong trình duyệt
function browserOnlyGuard() {
  return isPlatformBrowser(inject(PLATFORM_ID));
}

const routes: Routes = [
  {
    path: '',
    component: BloggerLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: BloggerDashboardComponent },
      { path: 'posts', component: BloggerPostsComponent },
      { 
        path: 'posts/create', 
        component: BloggerPostCreateComponent,
        canActivate: [browserOnlyGuard]
      },
      { 
        path: 'posts/edit/:id', 
        component: BloggerPostCreateComponent,
        canActivate: [browserOnlyGuard]
      },
      { path: 'comments', component: BloggerCommentsComponent },
      { path: 'settings', component: BloggerSettingsComponent },
      { path: 'media', component: BloggerMediaComponent },
      { path: 'profile', component: BloggerProfileComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BloggerRoutingModule { }