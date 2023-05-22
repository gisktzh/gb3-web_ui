import {Inject, Injectable} from '@angular/core';
import {defaultBasemap, defaultBasemaps} from '../configs/base-map.config';
import {defaultMapConfig} from '../configs/map.config';
import {MapConstants} from '../constants/map.constants';
import {DOCUMENT} from '@angular/common';
import {defaultRuntimeConfig} from '../configs/runtime.config';
import {ApiConfig, AuthSettings, OverrideSettings, RuntimeConfig} from '../interfaces/runtime-config.interface';
import {Gb2Constants} from '../constants/gb2.constants';
import {layerSymbolizations} from '../configs/symbolization.config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public readonly basemapConfig = {
    availableBasemaps: defaultBasemaps,
    defaultBasemap: defaultBasemap
  };

  public readonly layerSymbolizations = layerSymbolizations;

  public readonly gb2Config = {
    wmsFormatMimeType: Gb2Constants.WMS_IMAGE_FORMAT_MIME_TYPE
  };

  public readonly mapConfig = {
    internalLayerPrefix: MapConstants.INTERNAL_LAYER_PREFIX,
    locateMeZoom: MapConstants.LOCATE_ME_ZOOM,
    defaultMapConfig: defaultMapConfig,
    mapScaleConfig: {
      maxScale: MapConstants.MAXIMUM_MAP_SCALE,
      minScale: MapConstants.MINIMUM_MAP_SCALE
    }
  };

  public readonly apiConfig: ApiConfig;
  public readonly overridesConfig: OverrideSettings;
  public readonly authConfig: AuthSettings;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    const runtimeConfig = this.findRuntimeConfig();
    if (!runtimeConfig) {
      throw new Error('Cannot find a matching hostname for URL resolution.'); // todo: error handling for fatal errors
    }

    this.apiConfig = runtimeConfig.apiBasePaths;
    this.overridesConfig = runtimeConfig.overrides;
    this.authConfig = runtimeConfig.authSettings;
  }

  /**
   * Extracts the hostname from Document.location, also removing any port mappings.
   *
   * Then, tries to find a matching runtime configuration or returns undefined.
   * @private
   */
  private findRuntimeConfig(): RuntimeConfig | undefined {
    const hostName = this.document.location.host.split(':')[0];
    return defaultRuntimeConfig.find((config) => config.hostMatch === hostName);
  }
}
