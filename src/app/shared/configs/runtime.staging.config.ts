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
        baseUrl: 'https://testmaps.kt.ktzh.ch'
      },
      geoLion: {
        baseUrl: 'https://testgeolion.kt.ktzh.ch'
      },
      searchApi: {
        baseUrl: 'https://staging.geo.ktzh.ch/geosearch'
      },
      ktzhWebsite: {
        baseUrl: 'https://www.zh.ch',
        enabled: true
      },
      gravCms: {
        baseUrl: 'https://staging.geo.ktzh.ch/cms',
        enabled: false
      },
      twitterWidget: {
        baseUrl: 'https://platform.twitter.com/widgets.js',
        enabled: false
      }
    },
    authSettings: {
      clientId: 'gb3',
      issuer: 'https://testmaps.kt.ktzh.ch/'
    },
    overrides: {
      overrideWmsUrl: 'http://testwms.kt.ktzh.ch'
    }
  }
];
