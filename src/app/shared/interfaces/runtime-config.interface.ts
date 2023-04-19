interface ApiBaseUrlConfig {
  baseUrl: string;
}

interface OptionalApiBaseUrlConfig extends ApiBaseUrlConfig {
  enabled: boolean;
}

export interface ApiConfig {
  gb2Api: ApiBaseUrlConfig;
  gb2StaticFiles: ApiBaseUrlConfig;
  gb2Wms: ApiBaseUrlConfig;
  geoLion: ApiBaseUrlConfig;
  searchApi: ApiBaseUrlConfig;
  ktzhWebsite: OptionalApiBaseUrlConfig;
  gravCms: OptionalApiBaseUrlConfig;
  twitterWidget: OptionalApiBaseUrlConfig;
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
