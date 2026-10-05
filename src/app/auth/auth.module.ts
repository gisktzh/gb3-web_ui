import {provideHttpClient, withInterceptorsFromDi, withXhr} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {AuthConfig, OAuthModule, OAuthModuleConfig, OAuthStorage} from 'angular-oauth2-oidc';
import {authConfigFactory} from '../shared/factories/auth-config.factory';
import {oAuthConfigFactory} from '../shared/factories/o-auth-config.factory';
import {storageFactory} from '../shared/factories/storage.factory';
import {ConfigService} from '../shared/services/config.service';

@NgModule({
  imports: [OAuthModule.forRoot()],
  providers: [
    {provide: AuthConfig, useFactory: authConfigFactory, deps: [ConfigService]},
    {provide: OAuthModuleConfig, useFactory: oAuthConfigFactory, deps: [ConfigService]},
    {provide: OAuthStorage, useFactory: storageFactory},
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
  ],
})
export class AuthModule {}
