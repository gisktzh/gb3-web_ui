import {EnvironmentConfig} from './environment-config.interface';
import {APPLICATION_RELEASE, APPLICATION_VERSION} from '../version';

export const environment: EnvironmentConfig = {
  production: true,
  auth: {
    authenticatedPingInterval: 5000,
  },
  appVersion: APPLICATION_VERSION,
  appRelease: APPLICATION_RELEASE,
};
