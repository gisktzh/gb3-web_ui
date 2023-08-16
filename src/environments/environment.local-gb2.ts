/**
 * This file can be loaded with
 *
 * => ng serve --configuration=development-local-gb2
 *
 * and assumes that you have a local instance of GB2 running on port 3000, because this also proxies all requests using angular proxy.
 */

import {EnvironmentConfig} from './environment-config.interface';
import {APPLICATION_RELEASE, APPLICATION_VERSION} from '../version';

export const environment: EnvironmentConfig = {
  production: false,
  auth: {
    authenticatedPingInterval: 5000,
  },
  appVersion: APPLICATION_VERSION,
  appRelease: APPLICATION_RELEASE,
};
