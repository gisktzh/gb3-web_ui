export interface EnvironmentConfig {
  production: boolean;
  apiConfigs: {
    gb2Api: ApiConfig;
    gb2Wms: ApiConfig;
    geoLion: ApiConfig;
    searchApi: ApiConfig;
    ktzhWebsite: OptionalApiConfig;
    gravCms: OptionalApiConfig;
    twitterWidget: OptionalApiConfig;
  };
  /**
   * Set the following URL to point to a custom instance of the WMS, e.g. when using localhost deployments. This override the WMS URL that
   * is returned by the GetCapabilities request.
   */
  overrideWmsUrl?: string;
  auth: {
    issuer: string;
    clientId: string;
    authenticatedPingInterval: number;
  };
}

interface ApiConfig {
  baseUrl: string;
}

interface OptionalApiConfig extends ApiConfig {
  enabled: boolean;
}
