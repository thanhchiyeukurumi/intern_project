import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BloggerRoutingModule } from './blogger-routing.module';
import { BloggerLayoutComponent } from './layout/blogger-layout/blogger-layout.component';
import { BloggerDashboardComponent } from './containers/blogger-dashboard/blogger-dashboard.component';
import { BloggerPostsComponent } from './containers/blogger-posts/blogger-posts.component';
import { BloggerCommentsComponent } from './containers/blogger-comments/blogger-comments.component';
import { BloggerSettingsComponent } from './containers/blogger-settings/blogger-settings.component';
import { BloggerProfileComponent } from './containers/blogger-profile/blogger-profile.component';
import { BloggerMediaComponent } from './containers/blogger-media/blogger-media.component';

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
    BloggerMediaComponent
  ]
})
export class BloggerModule { }