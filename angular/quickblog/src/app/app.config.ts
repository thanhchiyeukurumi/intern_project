import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { vi_VN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideStore } from '@ngrx/store';

registerLocaleData(vi);

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay()), provideNzI18n(vi_VN), importProvidersFrom(FormsModule), provideAnimationsAsync(), provideHttpClient(), provideCharts(withDefaultRegisterables()), provideStore()]
};
