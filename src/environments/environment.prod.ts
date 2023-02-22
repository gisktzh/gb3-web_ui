import {EnvironmentConfig} from './environment-config.interface';

export const environment: EnvironmentConfig = {
  production: true,
  apiKey: 'gEPQJiSv_Kgi8WEslF2N', // This is a public user API key and not sensitive data.
  baseUrls: {
    gb2Api: 'https://maps.zh.ch',
    gb2Wms: 'https://wms.zh.ch',
    geoLion: 'https://www.geolion.zh.ch',
    ktzhWebsite: 'https://www.zh.ch'
  },
  auth: {
    issuer: 'tbd',
    clientId: 'tbd',
    authenticatedPingInterval: 5000
  }
};
