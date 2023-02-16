import {NgModule} from '@angular/core';
import {AuthConfig, OAuthModule, OAuthModuleConfig, OAuthStorage} from 'angular-oauth2-oidc';
import {HttpClientModule} from '@angular/common/http';
import {authConfig, oAuthConfig} from './auth.config';

function storageFactory(): OAuthStorage {
  return localStorage;
}

@NgModule({
  declarations: [],
  imports: [OAuthModule.forRoot(), HttpClientModule],
  providers: [
    {provide: AuthConfig, useValue: authConfig},
    {provide: OAuthModuleConfig, useValue: oAuthConfig},
    {provide: OAuthStorage, useFactory: storageFactory}
  ]
})
export class AuthModule {}
