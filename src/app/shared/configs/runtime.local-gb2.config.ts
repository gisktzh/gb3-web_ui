import {RuntimeConfig} from '../interfaces/runtime-config.interface';

/**
 * This runtime configuration is used for a local gb2 instance and replaces runtime.config.ts during build.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'localhost',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'http://localhost:4200/v3',
      },
      gb2StaticFiles: {
        baseUrl: 'http://localhost:4200',
      },
      gb2WmsCapabilities: {
        baseUrl: 'http://localhost:4200/wms',
      },
      gb2Wms: {
        baseUrl: 'http://localhost:4200',
      },
      geoLion: {
        baseUrl: 'https://www.geolion.zh.ch',
      },
      searchApi: {
        baseUrl: 'https://geo.zh.ch/geosearch',
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
    },
    authSettings: {
      clientId: 'gb3',
      issuer: 'http://localhost:4200/',
    },
    overrides: {
      overrideWmsUrl: 'http://localhost:4200/wms',
    },
  },
];
