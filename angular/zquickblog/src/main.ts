import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Chart, LinearScale, LineController, PointElement, LineElement, PieController, ArcElement, CategoryScale } from 'chart.js';

Chart.register(LinearScale, LineController, PointElement, LineElement, PieController, ArcElement, CategoryScale);
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
