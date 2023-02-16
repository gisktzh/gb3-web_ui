import {AuthConfig, OAuthModuleConfig} from 'angular-oauth2-oidc';
import {environment} from '../../environments/environment';
/* eslint-disable @typescript-eslint/naming-convention */

export const authConfig: AuthConfig = {
  issuer: environment.auth.issuer,
  clientId: environment.auth.clientId,
  showDebugInformation: !environment.production,
  responseType: 'code',
  redirectUri: `${window.location.origin}/`,
  scope: 'openid',
  /**
   * Both silentrefresh as well as session checks are not implemented in the GB2 backend. Hence, they need to be disabled to prevent the
   * tokens from being refreshed and the sessions from being checked for their validity.
   */
  useSilentRefresh: false,
  sessionChecksEnabled: false,
  customQueryParams: {
    // The following query is required by the GB2 backend as it's not set to default
    response_mode: 'query'
  },
  /**
   * Because we do not have refresh tokens, we need to log the user out as soon as the access token is expired. The skew factor in the used
   * package is set to 10 minutes, so we set it to 2 seconds here.
   *
   * See:
   * * https://github.com/manfredsteyer/angular-oauth2-oidc/issues/1135
   * * https://github.com/manfredsteyer/angular-oauth2-oidc/issues/1214
   */
  clockSkewInSec: 2
};

export const oAuthConfig: OAuthModuleConfig = {
  resourceServer: {
    allowedUrls: ['http://localhost:4200/v3', 'http://localhost:4200/wms'],
    sendAccessToken: true
  }
};
