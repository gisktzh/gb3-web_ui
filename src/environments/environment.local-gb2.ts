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
  apiConfigs: {
    gb2Api: {
      baseUrl: 'http://localhost:4200'
    },
    gb2Wms: {
      baseUrl: 'http://localhost:4200'
    },
    geoLion: {
      baseUrl: 'https://www.geolion.zh.ch'
    },
    ktzhWebsite: {
      baseUrl: 'https://www.zh.ch',
      enabled: true
    },
    gravCms: {
      baseUrl: 'https://gb3-grav-cms.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io',
      enabled: false
    },
    twitterWidget: {
      baseUrl: 'https://platform.twitter.com/widgets.js',
      enabled: false
    }
  },
  overrideWmsUrl: 'http://localhost:4200/wms',
  auth: {
    issuer: 'http://localhost:4200/',
    clientId: 'gb3',
    authenticatedPingInterval: 5000
  }
};
