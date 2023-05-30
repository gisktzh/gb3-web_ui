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
      gb2WmsCapabilities: {
        baseUrl: 'https://uatmaps.kt.ktzh.ch/wms'
      },
      gb2Wms: {
        baseUrl: 'https://uatmaps.kt.ktzh.ch'
      },
      geoLion: {
        baseUrl: 'https://uatgeolion.kt.ktzh.ch'
      },
      searchApi: {
        baseUrl: 'https://uat.geo.ktzh.ch/geosearch'
      },
      ktzhWebsite: {
        baseUrl: 'https://www.zh.ch',
        useMockData: false
      },
      gravCms: {
        baseUrl: 'https://uat.geo.ktzh.ch/cms',
        useMockData: false
      },
      twitterWidget: {
        baseUrl: 'https://platform.twitter.com/widgets.js'
      }
    },
    authSettings: {
      clientId: 'gb3',
      issuer: 'https://uatmaps.kt.ktzh.ch/'
    },
    overrides: {
      overrideWmsUrl: 'http://uatwms.kt.ktzh.ch'
    }
  }
];
