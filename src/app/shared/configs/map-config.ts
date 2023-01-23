import {MapConfigurationState} from '../../core/state/map/reducers/map-configuration.reducer';
import {defaultBackgroundMaps} from './base-map-config';

export const MINIMUM_MAP_SCALE = 1_500_000;
export const MAXIMUM_MAP_SCALE = 100;

export const defaultMapConfig: MapConfigurationState = {
  srsId: 2056,
  center: {
    x: 2682260.0,
    y: 1248390.0
  },
  scale: 50000,
  ready: false,
  scaleSettings: {
    minScale: MINIMUM_MAP_SCALE,
    maxScale: MAXIMUM_MAP_SCALE,
    calculatedMinScale: MINIMUM_MAP_SCALE,
    calculatedMaxScale: MAXIMUM_MAP_SCALE
  },
  isMaxZoomedIn: false,
  isMaxZoomedOut: false,
  backgroundMap: defaultBackgroundMaps[0]
};
