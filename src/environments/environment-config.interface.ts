export interface EnvironmentConfig {
  production: boolean;
  auth: {
    authenticatedPingInterval: number;
  };
  appVersion: string;
  appRelease: string;
  stagePrefix?: string;
}
