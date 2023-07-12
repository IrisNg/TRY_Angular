import { Route } from '@angular/router';
import { AnalyticsComponent } from './pages';

export const DASHBOARD_ROUTES: Route[] = [
  {
    path: '',
    component: AnalyticsComponent,
    pathMatch: 'full',
  },
];
