import {NgModule} from '@angular/core';
import {AuthConfig, OAuthModule, OAuthModuleConfig, OAuthStorage} from 'angular-oauth2-oidc';
import {HttpClientModule} from '@angular/common/http';
import {authConfig, oAuthConfig} from './auth.config';
import {AuthNotificationDialogComponent} from './notifications/auth-notification-dialog/auth-notification-dialog.component';
import {SharedModule} from '../shared/shared.module';
import {ConfigService} from '../shared/services/config.service';

function storageFactory(): OAuthStorage {
  return localStorage;
}

/**
 * Injects the allowed URLS where the token is sent, which is - currently - the gb2Api baseUrl.
 * @param configService
 */
function oAuthConfigFactory(configService: ConfigService): OAuthModuleConfig {
  const config = oAuthConfig;
  config.resourceServer.allowedUrls = [`${configService.apiConfig.gb2Api.baseUrl}/v3`];

  return config;
}

/**
 * Injects the issuer as the gb2Api baseUrl, since this is - currently - identical; we only add the slash at the end to match the issuer.
 * @param configService
 */
function authConfigFactory(configService: ConfigService): AuthConfig {
  const config = authConfig;
  authConfig.issuer = `${configService.apiConfig.gb2Api.baseUrl}/`;

  return config;
}

@NgModule({
  declarations: [AuthNotificationDialogComponent],
  imports: [OAuthModule.forRoot(), HttpClientModule, SharedModule],
  providers: [
    {provide: AuthConfig, useFactory: authConfigFactory, deps: [ConfigService]},
    {provide: OAuthModuleConfig, useFactory: oAuthConfigFactory, deps: [ConfigService]},
    {provide: OAuthStorage, useFactory: storageFactory}
  ]
})
export class AuthModule {}
