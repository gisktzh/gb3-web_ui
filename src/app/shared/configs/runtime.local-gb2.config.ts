import {RuntimeConfig} from '../interfaces/runtime-config.interface';

/**
 * This runtime configuration is used for a local gb2 instance and replaces runtime.config.ts during build.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'localhost',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'http://localhost:4200/v3'
      },
      gb2StaticFiles: {
        baseUrl: 'http://localhost:4200'
      },
      gb2Wms: {
        baseUrl: 'http://localhost:4200'
      },
      geoLion: {
        baseUrl: 'https://www.geolion.zh.ch'
      },
      searchApi: {
        baseUrl: 'https://gb3-search-api.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io'
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
    authSettings: {
      clientId: 'gb3',
      issuer: 'http://localhost:4200/'
    },
    overrides: {
      overrideWmsUrl: 'http://localhost:4200/wms'
    }
  }
];
