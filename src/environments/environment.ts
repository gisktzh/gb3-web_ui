// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {apiKey} from './environment.local';
import {EnvironmentConfig} from './environment-config.interface';

export const environment: EnvironmentConfig = {
  production: false,
  apiKey: apiKey,
  baseUrls: {
    gb3Api: 'https://maps.zh.ch',
    geoLion: 'https://www.geolion.zh.ch',
    ktzhWebsite: 'https://www.zh.ch'
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
