import {defaultBasemap} from './base-map.config';
import {MapConstants} from '../constants/map.constants';
import {MapConfigState} from '../../state/map/states/map-config.state';

export const defaultMapConfig: MapConfigState = {
  srsId: MapConstants.DEFAULT_SRS,
  center: {
    x: 2682260.0,
    y: 1248390.0,
  },
  scale: 320_000,
  ready: false,
  scaleSettings: {
    minScale: MapConstants.MINIMUM_MAP_SCALE,
    maxScale: MapConstants.MAXIMUM_MAP_SCALE,
    calculatedMinScale: MapConstants.MINIMUM_MAP_SCALE,
    calculatedMaxScale: MapConstants.MAXIMUM_MAP_SCALE,
  },
  isMaxZoomedIn: false,
  isMaxZoomedOut: false,
  activeBasemapId: defaultBasemap.id,
  initialMaps: [],
};
