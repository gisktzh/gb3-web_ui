import {OAuthModuleConfig} from 'angular-oauth2-oidc';
import {oAuthConfig} from 'src/app/auth/auth.config';
import {ConfigService} from '../services/config.service';

/**
 * Injects the allowed URLS where the token is sent, which is - currently - the gb2Api baseUrl.
 * @param configService
 */
export function oAuthConfigFactory(configService: ConfigService): OAuthModuleConfig {
  const config = oAuthConfig;
  config.resourceServer.allowedUrls = [`${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}`];

  return config;
}
