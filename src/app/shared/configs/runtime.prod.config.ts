import {RuntimeConfig} from '../interfaces/runtime-config.interface';

/**
 * This runtime configuration is used for the prod (intranet & internet) instance and replaces runtime.config.ts during build.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'geo.ktzh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://web.maps.zh.ch/gb3',
        version: 'v4',
      },
      gb2StaticFiles: {
        baseUrl: 'https://web.maps.zh.ch',
      },
      gb2WmsCapabilities: {
        baseUrl: 'https://web.maps.zh.ch/wms',
      },
      gb2Wms: {
        baseUrl: 'https://web.wms.zh.ch',
      },
      geoLion: {
        baseUrl: 'https://geolion.ktzh.ch',
      },
      ktzhWebsite: {
        baseUrl: 'https://www.zh.ch',
        useMockData: false,
      },
      gravCms: {
        baseUrl: 'https://geo.ktzh.ch/cms',
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
      issuer: 'https://web.maps.zh.ch/',
    },
    featureFlags: {
      koPlaNavItem: true,
    },
    overrides: {},
    accessMode: 'intranet',
  },
  {
    hostMatch: 'geo.zh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://maps.zh.ch/gb3',
        version: 'v4',
      },
      gb2StaticFiles: {
        baseUrl: 'https://maps.zh.ch',
      },
      gb2WmsCapabilities: {
        baseUrl: 'https://maps.zh.ch/wms',
      },
      gb2Wms: {
        baseUrl: 'https://wms.zh.ch',
      },
      geoLion: {
        baseUrl: 'https://geolion.zh.ch',
      },
      ktzhWebsite: {
        baseUrl: 'https://www.zh.ch',
        useMockData: false,
      },
      gravCms: {
        baseUrl: 'https://geo.zh.ch/cms',
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
      issuer: 'https://maps.zh.ch/',
    },
    featureFlags: {},
    overrides: {},
    accessMode: 'internet',
  },
];
