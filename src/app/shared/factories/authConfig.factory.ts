import {AuthConfig} from 'angular-oauth2-oidc';
import {authConfig} from 'src/app/auth/auth.config';
import {ConfigService} from '../services/config.service';

/**
 * Injects the issuer as the gb2Api baseUrl, since this is - currently - identical; we only add the slash at the end to match the issuer.
 * @param configService
 */
export function authConfigFactory(configService: ConfigService): AuthConfig {
  const config = authConfig;
  authConfig.issuer = configService.authConfig.issuer;
  authConfig.clientId = configService.authConfig.clientId;

  return config;
}
