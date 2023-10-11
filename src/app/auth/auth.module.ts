import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {AuthConfig, OAuthModule, OAuthModuleConfig, OAuthStorage} from 'angular-oauth2-oidc';
import {authConfigFactory} from '../shared/factories/auth-config.factory';
import {oAuthConfigFactory} from '../shared/factories/o-auth-config.factory';
import {storageFactory} from '../shared/factories/storage.factory';
import {ConfigService} from '../shared/services/config.service';
import {SharedModule} from '../shared/shared.module';
import {AuthRoutingModule} from './auth-routing.module';
import {LoginRedirectComponent} from './components/login-redirect/login-redirect.component';
import {AuthNotificationDialogComponent} from './notifications/auth-notification-dialog/auth-notification-dialog.component';

@NgModule({
  declarations: [AuthNotificationDialogComponent, LoginRedirectComponent],
  imports: [OAuthModule.forRoot(), HttpClientModule, SharedModule, AuthRoutingModule],
  providers: [
    {provide: AuthConfig, useFactory: authConfigFactory, deps: [ConfigService]},
    {provide: OAuthModuleConfig, useFactory: oAuthConfigFactory, deps: [ConfigService]},
    {provide: OAuthStorage, useFactory: storageFactory},
  ],
})
export class AuthModule {}
