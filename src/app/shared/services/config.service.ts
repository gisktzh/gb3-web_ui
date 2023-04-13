import {Injectable} from '@angular/core';
import {defaultBasemap, defaultBasemaps} from '../configs/base-map-config';
import {defaultHighlightStyles} from '../configs/feature-info-config';
import {defaultMapConfig} from '../configs/map-config';
import {MapConstants} from '../constants/map.constants';
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
}
