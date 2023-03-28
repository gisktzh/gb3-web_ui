import {NgModule} from '@angular/core';
import {AuthConfig, OAuthModule, OAuthModuleConfig, OAuthStorage} from 'angular-oauth2-oidc';
import {HttpClientModule} from '@angular/common/http';
import {authConfig, oAuthConfig} from './auth.config';
import {AuthNotificationDialogComponent} from './notifications/auth-notification-dialog/auth-notification-dialog.component';
import {SharedModule} from '../shared/shared.module';

function storageFactory(): OAuthStorage {
  return localStorage;
}

@NgModule({
  declarations: [AuthNotificationDialogComponent],
  imports: [OAuthModule.forRoot(), HttpClientModule, SharedModule],
  providers: [
    {provide: AuthConfig, useValue: authConfig},
    {provide: OAuthModuleConfig, useValue: oAuthConfig},
    {provide: OAuthStorage, useFactory: storageFactory}
  ]
})
export class AuthModule {}
