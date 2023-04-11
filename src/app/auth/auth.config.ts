import {AuthConfig, OAuthModuleConfig} from 'angular-oauth2-oidc';
import {environment} from '../../environments/environment';
/* eslint-disable @typescript-eslint/naming-convention */

export const authConfig: AuthConfig = {
  issuer: '', // this is overriden in the module component via the factory to inject the correct runtime URL
  clientId: environment.auth.clientId,
  showDebugInformation: !environment.production,
  responseType: 'code',
  redirectUri: `${window.location.origin}/`,
  scope: 'openid profile',
  /**
   * The following flag is used because we do not have ID tokens; so we cannot do the strict subject check required by OIDC (compare the sub
   * of the accesstoken with the ID token). The library errors if we check this, and rightly so.
   *
   * More info:
   * https://github.com/manfredsteyer/angular-oauth2-oidc-angular-package-format/blob/master/angular-oauth2-oidc/src/oauth-service.ts#L492
   */
  skipSubjectCheck: true,
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
    allowedUrls: [], // this is overriden in the module component via the factory to inject the correct runtime URLs
    sendAccessToken: true
  }
};
