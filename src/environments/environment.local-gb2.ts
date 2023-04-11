/**
 * This file can be loaded with
 *
 * => ng serve --configuration=development-local-gb2
 *
 * and assumes that you have a local instance of GB2 running on port 3000, because this also proxies all requests using angular proxy.
 */

import {EnvironmentConfig} from './environment-config.interface';

export const environment: EnvironmentConfig = {
  production: false,
  auth: {
    clientId: 'gb3',
    authenticatedPingInterval: 5000
  }
};
