import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

/**
 * Provider cho HTTP interceptors trong ứng dụng
 * Gộp lại cho gọn
 */
export const httpInterceptorProviders = [
  provideHttpClient(
    withInterceptors([
      authInterceptor,
    ])
  )
];
