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
  baseUrls: {
    gb2Api: 'http://localhost:4200',
    gb2Wms: 'http://localhost:4200',
    geoLion: 'https://www.geolion.zh.ch',
    overrideWmsUrl: 'http://localhost:4200/wms'
  },
  auth: {
    issuer: 'http://localhost:4200/',
    clientId: 'gb3',
    authenticatedPingInterval: 5000
  }
};
