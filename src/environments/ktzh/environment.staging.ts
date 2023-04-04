import {EnvironmentConfig} from '../environment-config.interface';

export const environment: EnvironmentConfig = {
  production: true,
  apiConfigs: {
    gb2Api: {
      baseUrl: 'https://testmaps.kt.ktzh.ch'
    },
    gb2Wms: {
      baseUrl: 'https://testwms.kt.ktzh.ch'
    },
    geoLion: {
      baseUrl: 'https://testgeolion.kt.ktzh.ch'
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
  auth: {
    issuer: 'https://testmaps.kt.ktzh.ch/',
    clientId: 'gb3',
    authenticatedPingInterval: 5000
  }
};
