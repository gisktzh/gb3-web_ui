import {RuntimeConfig} from '../interfaces/runtime-config.interface';

/**
 * This runtime configuration is used for the staging instance and replaces runtime.config.ts during build.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'staging.geo.ktzh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://testmaps.kt.ktzh.ch/gb3',
        version: 'v2',
      },
      gb2StaticFiles: {
        baseUrl: 'https://testmaps.kt.ktzh.ch',
      },
      gb2WmsCapabilities: {
        baseUrl: 'https://testmaps.kt.ktzh.ch/wms',
      },
      gb2Wms: {
        baseUrl: 'https://testmaps.kt.ktzh.ch',
      },
      geoLion: {
        baseUrl: 'https://testgeolion.kt.ktzh.ch',
      },
      searchApi: {
        baseUrl: 'https://testmaps.kt.ktzh.ch/gb3',
        version: 'v2',
      },
      ktzhWebsite: {
        baseUrl: 'https://www.zh.ch',
        useMockData: false,
      },
      gravCms: {
        baseUrl: 'https://staging.geo.ktzh.ch/cms',
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
      issuer: 'https://testmaps.kt.ktzh.ch/',
    },
    featureFlags: {},
    overrides: {
      overrideWmsUrl: 'http://testwms.kt.ktzh.ch',
    },
  },
];
