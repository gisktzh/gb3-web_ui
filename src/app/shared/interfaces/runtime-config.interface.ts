interface ApiBaseUrlConfig {
  baseUrl: string;
}

interface OptionalApiBaseUrlConfig extends ApiBaseUrlConfig {
  enabled: boolean;
}

export interface ApiConfig {
  gb2Api: ApiBaseUrlConfig;
  gb2Wms: ApiBaseUrlConfig;
  geoLion: ApiBaseUrlConfig;
  ktzhWebsite: OptionalApiBaseUrlConfig;
  gravCms: OptionalApiBaseUrlConfig;
  twitterWidget: OptionalApiBaseUrlConfig;
}

export interface OverrideSettings {
  overrideWmsUrl?: string;
}

export interface RuntimeConfig {
  hostMatch: string;
  apiBasePaths: ApiConfig;
  overrides: OverrideSettings;
}
