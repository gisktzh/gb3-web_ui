import {RuntimeConfig} from '../interfaces/runtime-config.interface';

/**
 * This runtime configuration is used for all unspecified build targets, i.e. local development. In other builds, this file is replaced.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'localhost',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://maps.zh.ch/v3',
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
        baseUrl: 'https://www.geolion.zh.ch',
      },
      searchApi: {
        baseUrl: 'https://maps.zh.ch/v3',
      },
      ktzhWebsite: {
        baseUrl: 'https://www.zh.ch',
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
    },
    authSettings: {
      clientId: 'gb3',
      issuer: 'https://maps.zh.ch/',
    },
    overrides: {},
  },
];
