import {RuntimeConfig} from '../interfaces/runtime-config.interface';

/**
 * This runtime configuration is used for the staging instance with a direct connection to the productive GB2 backend and replaces
 * runtime.config.ts during build. Note that this is a temporary solution as it is a mix between staging and productive environment.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'staging.geo.ktzh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://web.maps.zh.ch/v3',
      },
      gb2StaticFiles: {
        baseUrl: 'https://web.maps.zh.ch',
      },
      gb2WmsCapabilities: {
        baseUrl: 'https://web.maps.zh.ch/wms',
      },
      gb2Wms: {
        baseUrl: 'https://web.maps.zh.ch',
      },
      geoLion: {
        baseUrl: 'https://geolion.ktzh.ch',
      },
      searchApi: {
        baseUrl: 'https://staging.geo.ktzh.ch/geosearch',
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
    },
    authSettings: {
      clientId: 'gb3',
      issuer: 'https://web.maps.zh.ch/',
    },
    overrides: {
      overrideWmsUrl: 'https://web.wms.zh.ch',
    },
  },
];
