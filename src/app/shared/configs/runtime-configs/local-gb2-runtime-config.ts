import {RuntimeConfig} from '../../interfaces/runtime-config.interface';

/**
 * This configuration is based for a local deployment of the GB2 backend. It replaces the default local-runtime-config.ts when started with
 * the respective boot parameter.
 */
export const localRuntimeConfig: RuntimeConfig = {
  hostMatch: 'localhost:4200',
  apiBasePaths: {
    gb2Api: {
      baseUrl: 'http://localhost:4200'
    },
    gb2Wms: {
      baseUrl: 'http://localhost:4200'
    },
    geoLion: {
      baseUrl: 'https://www.geolion.zh.ch'
    },
    ktzhWebsite: {
      baseUrl: 'https://www.zh.ch',
      enabled: true
    },
    gravCms: {
      baseUrl: 'https://gb3-grav-cms.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io',
      enabled: false
    },
    twitterWidget: {
      baseUrl: 'https://platform.twitter.com/widgets.js',
      enabled: false
    }
  },
  overrides: {
    overrideWmsUrl: 'http://localhost:4200/wms'
  }
};
