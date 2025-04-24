import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'blogger',
    loadChildren: () => import('./features/blogger/blogger.module').then(m => m.BloggerModule)
  },
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  }
];
