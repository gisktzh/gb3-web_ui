import {RuntimeConfig} from '../interfaces/runtime-config.interface';

/**
 * This runtime configuration is used for the UAT instance and replaces runtime.config.ts during build.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'uat.geo.ktzh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://uatmaps.kt.ktzh.ch/gb3',
        version: 'v3',
      },
      gb2StaticFiles: {
        baseUrl: 'https://uatmaps.kt.ktzh.ch',
      },
      gb2WmsCapabilities: {
        baseUrl: 'https://uatmaps.kt.ktzh.ch/wms',
      },
      gb2Wms: {
        baseUrl: 'https://uatmaps.kt.ktzh.ch',
      },
      geoLion: {
        baseUrl: 'https://uatgeolion.kt.ktzh.ch',
      },
      ktzhWebsite: {
        baseUrl: 'https://www.zh.ch',
        useMockData: false,
      },
      gravCms: {
        baseUrl: 'https://uat.geo.ktzh.ch/cms',
        useMockData: false,
      },
      twitterWidget: {
        baseUrl: 'https://platform.twitter.com/widgets.js',
      },
      geoshopApi: {
        baseUrl: 'https://geoservices.zh.ch/geoshopapi/v1',
      },
      ownershipInformationApi: {
        baseUrl: 'https://portal.objektwesen.zh.ch/aks/detail',
      },
      swisstopoRestApi: {
        baseUrl: 'https://api3.geo.admin.ch/rest/services',
      },
    },
    authSettings: {
      clientId: 'gb3',
      issuer: 'https://uatmaps.kt.ktzh.ch/',
    },
    featureFlags: {
      iframeShareLink: true,
      koPlaNavItem: true,
    },
    overrides: {
      overrideWmsUrl: 'http://uatwms.kt.ktzh.ch',
    },
  },
];
