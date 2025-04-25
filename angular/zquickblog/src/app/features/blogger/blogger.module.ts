import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_INITIALIZER } from '@angular/core';

import { BloggerRoutingModule } from './blogger-routing.module';
import { BloggerLayoutComponent } from './layout/blogger-layout/blogger-layout.component';
import { BloggerDashboardComponent } from './containers/blogger-dashboard/blogger-dashboard.component';
import { BloggerPostsComponent } from './containers/blogger-posts/blogger-posts.component';
import { BloggerCommentsComponent } from './containers/blogger-comments/blogger-comments.component';
import { BloggerSettingsComponent } from './containers/blogger-settings/blogger-settings.component';
import { BloggerProfileComponent } from './containers/blogger-profile/blogger-profile.component';
import { BloggerMediaComponent } from './containers/blogger-media/blogger-media.component';
import { BloggerPostCreateComponent } from './containers/blogger-post-create/blogger-post-create.component';

// Kiểm tra môi trường khi khởi tạo module
export function browserCheckFactory() {
  return () => {
    // Không làm gì khi ở server, chỉ phục vụ SSR
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.log('[SSR] Quill editor sẽ được nạp trong môi trường browser');
      return Promise.resolve();
    }
    
    // Khởi tạo nếu ở browser
    return Promise.resolve();
  };
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BloggerRoutingModule,
    BloggerLayoutComponent,
    BloggerDashboardComponent,
    BloggerPostsComponent,
    BloggerCommentsComponent,
    BloggerSettingsComponent,
    BloggerProfileComponent,
    BloggerMediaComponent,
    BloggerPostCreateComponent
  ],
  providers: [
    {
      provide: APP_INITIALIZER, 
      useFactory: browserCheckFactory,
      multi: true
    }
  ]
})
export class BloggerModule { }