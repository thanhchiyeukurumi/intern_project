import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

/**
 * Provider cho HTTP interceptors trong ứng dụng
 */
export const httpInterceptorProviders = [
  provideHttpClient(
    withInterceptors([
      authInterceptor,
      // Thêm các interceptor khác ở đây
    ])
  )
];
