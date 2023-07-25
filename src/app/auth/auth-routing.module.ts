import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {LoginRedirectComponent} from './components/login-redirect/login-redirect.component';
import {AUTH_REDIRECT_PATH} from './auth.config';

const routes: Routes = [
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

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
