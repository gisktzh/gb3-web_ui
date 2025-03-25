import {RuntimeConfig} from '../interfaces/runtime-config.interface';

/**
 * This runtime configuration is used for a local gb2 instance and replaces runtime.config.ts during build.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'localhost',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'http://localhost:3000/gb3',
        version: 'v4',
      },
      gb2StaticFiles: {
        baseUrl: 'http://localhost:3000',
      },
      gb2WmsCapabilities: {
        baseUrl: 'http://localhost:3000/wms',
      },
      gb2Wms: {
        baseUrl: 'http://localhost:3000',
      },
      geoLion: {
        baseUrl: 'https://geolion.zh.ch',
      },
      ktzhWebsite: {
        baseUrl: 'https://zh.ch',
        useMockData: true,
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
      issuer: 'http://localhost:3000/',
    },
    featureFlags: {},
    overrides: {
      overrideWmsUrl: 'http://localhost:3000/wms',
    },
    accessMode: 'internet',
  },
  {
    hostMatch: '127.0.0.1',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'http://127.0.0.1:3000/gb3',
        version: 'v4',
      },
      gb2StaticFiles: {
        baseUrl: 'http://127.0.0.1:3000',
      },
      gb2WmsCapabilities: {
        baseUrl: 'http://127.0.0.1:3000/wms',
      },
      gb2Wms: {
        baseUrl: 'http://127.0.0.1:3000',
      },
      geoLion: {
        baseUrl: 'https://geolion.ktzh.ch/',
      },
      ktzhWebsite: {
        baseUrl: 'https://zh.ch',
        useMockData: true,
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
      issuer: 'http://localhost:3000/',
    },
    featureFlags: {
      koPlaNavItem: true,
    },
    overrides: {
      overrideWmsUrl: 'http://127.0.0.1:3000/wms',
    },
    accessMode: 'intranet',
  },
];
