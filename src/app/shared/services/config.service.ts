import {Inject, Injectable} from '@angular/core';
import {defaultBasemap, defaultBasemaps} from '../configs/base-map-config';
import {defaultHighlightStyles} from '../configs/feature-info-config';
import {defaultMapConfig} from '../configs/map-config';
import {MapConstants} from '../constants/map.constants';
import {DOCUMENT} from '@angular/common';
import {defaultRuntimeConfig} from '../configs/runtime-config';
import {ApiConfig, OverrideSettings, RuntimeConfig} from '../interfaces/runtime-config.interface';
import {Gb2Constants} from '../constants/gb2.constants';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public readonly basemapConfig = {
    availableBasemaps: defaultBasemaps,
    defaultBasemap: defaultBasemap
  };

  public readonly featureInfoConfig = {
    defaultHighlightStyles: defaultHighlightStyles
  };

  public readonly gb2Config = {
    wmsFormatMimeType: Gb2Constants.WMS_IMAGE_FORMAT_MIME_TYPE
  };

  public readonly mapConfig = {
    defaultMapConfig: defaultMapConfig,
    mapScaleConfig: {
      maxScale: MapConstants.MAXIMUM_MAP_SCALE,
      minScale: MapConstants.MINIMUM_MAP_SCALE
    }
  };

  public readonly apiConfig: ApiConfig;
  public readonly overridesConfig: OverrideSettings;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    const runtimeConfig = this.getRuntimeConfigOrFail();
    this.apiConfig = runtimeConfig.apiBasePaths;
    this.overridesConfig = runtimeConfig.overrides;
  }

  /**
   * Extracts the hostname from Document.location, also removing any port mappings.
   *
   * Then, tries to find a matching runtime configuration or raises an exception.
   * @private
   */
  private getRuntimeConfigOrFail(): RuntimeConfig {
    const hostName = this.document.location.host.split(':')[0];
    const runtimeConfig = defaultRuntimeConfig.find((config) => config.hostMatch === hostName);

    if (runtimeConfig) {
      return runtimeConfig;
    }

    throw new Error('Cannot find a matching hostname for URL resolution.'); // todo: error handling for fatal errors
  }
}
