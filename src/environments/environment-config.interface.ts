export interface EnvironmentConfig {
  production: boolean;
  auth: {
    clientId: string;
    authenticatedPingInterval: number;
  };
}
