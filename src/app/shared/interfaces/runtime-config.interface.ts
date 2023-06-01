interface ApiBaseUrlConfig {
  baseUrl: string;
}

interface MockedApiBaseUrlConfig extends ApiBaseUrlConfig {
  useMockData: boolean;
}

export interface ApiConfig {
  gb2Api: ApiBaseUrlConfig;
  gb2StaticFiles: ApiBaseUrlConfig;
  /** Since the GetCapabilities requests might be routed to another domain than the *actual* WMS (e.g.
   * https://maps.zh.ch/wms/MAPNAME?request=GetCapabilities), this URL is hardcoded as well to ensure the token is attached to all
   * required requests.
   */
  gb2WmsCapabilities: ApiBaseUrlConfig;
  /**
   * This is the actual WMS URL that serves the map images.
   */
  gb2Wms: ApiBaseUrlConfig;
  geoLion: ApiBaseUrlConfig;
  searchApi: ApiBaseUrlConfig;
  ktzhWebsite: MockedApiBaseUrlConfig;
  gravCms: MockedApiBaseUrlConfig;
  twitterWidget: ApiBaseUrlConfig;
}

export interface OverrideSettings {
  overrideWmsUrl?: string;
}

export interface AuthSettings {
  /**
   * The issuer is used for finding the basepath of the auth host. Note that the comparison is character-wise, so if the issuer in the token
   * features a trailing slash, this needs to be appended as well.
   */
  issuer: string;
  clientId: string;
}

export interface RuntimeConfig {
  hostMatch: string;
  apiBasePaths: ApiConfig;
  overrides: OverrideSettings;
  authSettings: AuthSettings;
}
