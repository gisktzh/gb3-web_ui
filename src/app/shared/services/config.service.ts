import {Injectable} from '@angular/core';
import {defaultBasemap, defaultBasemaps} from '../configs/base-map-config';
import {defaultHighlightStyles} from '../configs/feature-info-config';
import {defaultMapConfig, MAXIMUM_MAP_SCALE, MINIMUM_MAP_SCALE} from '../configs/map-config';

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

  public readonly mapConfig = {
    defaultMapConfig: defaultMapConfig,
    mapScaleConfig: {
      maxScale: MAXIMUM_MAP_SCALE,
      minScale: MINIMUM_MAP_SCALE
    }
  };
}
