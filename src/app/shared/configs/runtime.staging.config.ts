import {RuntimeConfig} from '../interfaces/runtime-config.interface';

/**
 * This runtime configuration is used for the staging instance and replaces runtime.config.ts during build.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'staging.geo.ktzh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://testmaps.kt.ktzh.ch/v3'
      },
      gb2StaticFiles: {
        baseUrl: 'https://testmaps.kt.ktzh.ch'
      },
      gb2Wms: {
        baseUrl: 'https://testwms.kt.ktzh.ch'
      },
      geoLion: {
        baseUrl: 'https://testgeolion.kt.ktzh.ch'
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
    overrides: {}
  }
];
