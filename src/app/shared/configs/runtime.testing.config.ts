import {RuntimeConfig} from '../interfaces/runtime-config.interface';
import {defaultFeatureFlags} from './feature-flags.config';

/**
 * This runtime configuration is used in the testing environment.
 */
export const defaultRuntimeConfig: RuntimeConfig[] = [
  {
    hostMatch: 'localhost',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://maps.zh.ch/gb3',
        version: 'v1',
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
        baseUrl: 'https://maps.zh.ch/gb3',
        version: 'v1',
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
      swisstopoRestApi: {
        baseUrl: 'https://api3.geo.admin.ch/rest/services',
      },
    },
    authSettings: {
      clientId: 'gb3',
      issuer: 'https://maps.zh.ch/',
    },
    featureFlags: {
      // override to make sure we can test the merge functionality
      oerebExtract: !defaultFeatureFlags.oerebExtract,
    },
    overrides: {},
  },
];
