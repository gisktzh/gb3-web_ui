import {RuntimeConfig} from '../interfaces/runtime-config.interface';

/**
 * This runtime configuration is used for the EBP dev instance and replaces runtime.config.ts during build.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'calm-plant-0ecbec603.2.azurestaticapps.net',
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
        useMockData: false
      },
      gravCms: {
        baseUrl: 'https://gb3-grav-cms.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io',
        useMockData: true
      },
      twitterWidget: {
        baseUrl: 'https://platform.twitter.com/widgets.js'
      }
    },
    authSettings: {
      clientId: 'gb3',
      issuer: 'https://maps.zh.ch/'
    },
    overrides: {}
  },
  {
    hostMatch: 'dev.geo.zh.ch',
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
        useMockData: false
      },
      gravCms: {
        baseUrl: 'https://gb3-grav-cms.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io',
        useMockData: true
      },
      twitterWidget: {
        baseUrl: 'https://platform.twitter.com/widgets.js'
      }
    },
    authSettings: {
      clientId: 'gb3',
      issuer: 'https://maps.zh.ch/'
    },
    overrides: {}
  }
];
