import {EnvironmentConfig} from './environment-config.interface';

export const environment: EnvironmentConfig = {
  production: true,
  baseUrls: {
    gb2Api: 'https://maps.zh.ch',
    gb2Wms: 'https://wms.zh.ch',
    geoLion: 'https://www.geolion.zh.ch',
    ktzhWebsite: 'https://www.zh.ch'
  },
  auth: {
    issuer: 'https://maps.zh.ch/',
    clientId: 'gb3',
    authenticatedPingInterval: 5000
  }
};
