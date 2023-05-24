import {RuntimeConfig} from '../interfaces/runtime-config.interface';

/**
 * This runtime configuration is used for the prod (intranet & internet) instance and replaces runtime.config.ts during build.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'geo.ktzh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://web.maps.zh.ch/v3'
      },
      gb2StaticFiles: {
        baseUrl: 'https://web.maps.zh.ch'
      },
      gb2WmsCapabilities: {
        baseUrl: 'https://web.maps.zh.ch/wms'
      },
      gb2Wms: {
        baseUrl: 'https://web.wms.zh.ch'
      },
      geoLion: {
        baseUrl: 'https://geolion.ktzh.ch'
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
        enabled: true
      },
      twitterWidget: {
        baseUrl: 'https://platform.twitter.com/widgets.js',
        enabled: false
      }
    },
    authSettings: {
      clientId: 'gb3',
      issuer: 'https://web.maps.zh.ch/'
    },
    overrides: {}
  },
  {
    hostMatch: 'geo.zh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://maps.zh.ch/v3'
      },
      gb2StaticFiles: {
        baseUrl: 'https://maps.zh.ch'
      },
      gb2WmsCapabilities: {
        baseUrl: 'https://maps.zh.ch/wms'
      },
      gb2Wms: {
        baseUrl: 'https://wms.zh.ch'
      },
      geoLion: {
        baseUrl: 'https://geolion.zh.ch'
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
      issuer: 'https://maps.zh.ch/'
    },
    overrides: {}
  }
];
