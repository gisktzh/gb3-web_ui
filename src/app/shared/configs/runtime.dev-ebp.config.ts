import {RuntimeConfig} from '../interfaces/runtime-config.interface';

/**
 * This runtime configuration is used for the EBP dev instance and replaces runtime.config.ts during build.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'calm-plant-0ecbec603.2.azurestaticapps.net',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://maps.zh.ch/gb3',
        version: 'v3',
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
  },
  {
    hostMatch: 'dev.geo.zh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://maps.zh.ch/gb3',
        version: 'v2',
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
  },
];
