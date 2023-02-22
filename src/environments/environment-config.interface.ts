export interface EnvironmentConfig {
  production: boolean;
  apiKey: string;
  baseUrls: {
    gb2Api: string;
    gb2Wms: string;
    geoLion: string;
    /**
     * Set the following URL to point to a custom instance of the WMS, e.g. when using localhost deployments. This override the WMS URL that
     * is returned by the GetCapabilities request.
     */
    overrideWmsUrl?: string;
  };
  auth: {
    issuer: string;
    clientId: string;
    authenticatedPingInterval: number;
  };
}
