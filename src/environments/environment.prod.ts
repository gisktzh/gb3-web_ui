import {EnvironmentConfig} from './environment-config.interface';

export const environment: EnvironmentConfig = {
  production: true,
  auth: {
    clientId: 'gb3',
    authenticatedPingInterval: 5000
  }
};
