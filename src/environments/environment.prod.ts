import {apiKey} from './environment.local';

export const environment = {
  production: true,
  apiKey: apiKey,
  baseUrls: {
    gb3Api: 'https://maps.zh.ch',
    geoLion: 'https://www.geolion.zh.ch'
  }
};
