import {Routes} from '@angular/router';
import {LoginRedirectComponent} from './components/login-redirect/login-redirect.component';
import {AUTH_REDIRECT_PATH} from './auth.config';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: AUTH_REDIRECT_PATH,
        component: LoginRedirectComponent,
      },
      {
        pathMatch: 'full',
        path: '',
        redirectTo: '/',
      },
    ],
  },
];
