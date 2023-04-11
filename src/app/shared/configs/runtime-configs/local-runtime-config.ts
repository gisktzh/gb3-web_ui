import {RuntimeConfig} from '../../interfaces/runtime-config.interface';

export const localRuntimeConfig: RuntimeConfig = {
  hostMatch: 'localhost:4200',
  apiBasePaths: {
    gb2Api: {
      baseUrl: 'https://maps.zh.ch'
    },
    gb2Wms: {
      baseUrl: 'https://wms.zh.ch'
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
  overrides: {}
};
