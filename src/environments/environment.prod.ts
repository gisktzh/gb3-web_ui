import {EnvironmentConfig} from './environment-config.interface';

export const environment: EnvironmentConfig = {
  production: true,
  auth: {
    authenticatedPingInterval: 5000,
  },
};
