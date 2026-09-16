import {AuthConfig} from 'angular-oauth2-oidc';
import {authConfig} from 'src/app/auth/auth.config';
import {AUTH_REDIRECT_PATH} from 'src/app/auth/auth.config';
import {MainPage} from '../enums/main-page.enum';
import {ConfigService} from '../services/config.service';

/**
 * Injects the issuer as the gb2Api baseUrl, since this is - currently - identical; we only add the slash at the end to match the issuer.
 * @param configService
 */
export function authConfigFactory(configService: ConfigService, document: Document): AuthConfig {
  return {
    ...authConfig,
    issuer: configService.authConfig.issuer,
    clientId: configService.authConfig.clientId,
    redirectUri: `${document.location.origin}/${MainPage.Auth}/${AUTH_REDIRECT_PATH}`,
  };
}
