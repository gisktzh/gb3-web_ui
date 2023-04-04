// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {EnvironmentConfig} from './environment-config.interface';

export const environment: EnvironmentConfig = {
  production: false,
  apiConfigs: {
    gb2Api: {
      baseUrl: 'https://maps.zh.ch'
    },
    gb2Wms: {
      baseUrl: 'https://wms.zh.ch'
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
  auth: {
    issuer: 'https://maps.zh.ch/',
    clientId: 'gb3',
    authenticatedPingInterval: 5000
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
