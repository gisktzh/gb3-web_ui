import {Routes} from '@angular/router';

export const APPS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./apps-page.component').then((x) => x.AppsPageComponent),
    children: [],
  },
];
