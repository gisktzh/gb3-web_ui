import {RuntimeConfig} from '../interfaces/runtime-config.interface';

/**
 * This runtime configuration is used for the UAT instance and replaces runtime.config.ts during build.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'uat.geo.ktzh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://uatmaps.kt.ktzh.ch/v3'
      },
      gb2StaticFiles: {
        baseUrl: 'https://uatmaps.kt.ktzh.ch'
      },
      gb2Wms: {
        baseUrl: 'https://uatwms.kt.ktzh.ch'
      },
      geoLion: {
        baseUrl: 'https://uatgeolion.kt.ktzh.ch'
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
      issuer: 'https://uatmaps.kt.ktzh.ch/'
    },
    overrides: {}
  }
];
