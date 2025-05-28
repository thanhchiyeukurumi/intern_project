import { NgModule, APP_INITIALIZER, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BloggerRoutingModule } from './blogger-routing.module';
import { BloggerLayoutComponent } from './layout/blogger-layout/blogger-layout.component';
import { BloggerDashboardComponent } from './containers/blogger-dashboard/blogger-dashboard.component';
import { BloggerPostsComponent } from './containers/blogger-posts/blogger-posts.component';
import { BloggerCommentsComponent } from './containers/blogger-comments/blogger-comments.component';
import { BloggerSettingsComponent } from './containers/blogger-settings/blogger-settings.component';
import { BloggerProfileComponent } from './containers/blogger-profile/blogger-profile.component';
import { BloggerMediaComponent } from './containers/blogger-media/blogger-media.component';
import { BloggerPostCreateComponent } from './containers/blogger-post-create/blogger-post-create.component';
import { BloggerPostEditComponent } from './containers/blogger-post-edit/blogger-post-edit.component';
import { BloggerNewLanComponent } from './containers/blogger-new-lan/blogger-new-lan.component';

// Factory function để kiểm tra nếu đang chạy trong trình duyệt
export function browserCheckFactory() {
  const platformId = inject(PLATFORM_ID);
  return () => {
    if (!isPlatformBrowser(platformId)) {
      console.warn('Blogger module requires browser environment for certain features');
    }
    return true;
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
    BloggerPostCreateComponent,
    BloggerPostEditComponent,
    BloggerNewLanComponent
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