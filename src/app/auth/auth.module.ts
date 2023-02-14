import {NgModule} from '@angular/core';
import {AuthConfig, OAuthModule, OAuthModuleConfig} from 'angular-oauth2-oidc';
import {HttpClientModule} from '@angular/common/http';
import {authConfig, oAuthConfig} from './auth.config';

@NgModule({
  declarations: [],
  imports: [OAuthModule.forRoot(), HttpClientModule],
  providers: [
    {provide: AuthConfig, useValue: authConfig},
    {provide: OAuthModuleConfig, useValue: oAuthConfig}
  ]
})
export class AuthModule {}
