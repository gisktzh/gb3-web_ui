import {defaultBasemap} from './base-map.config';
import {MapConstants} from '../constants/map.constants';
import {MapConfigState} from '../../state/map/states/map-config.state';

export const defaultMapConfig: MapConfigState = {
  isMapServiceInitialized: false,
  srsId: MapConstants.DEFAULT_SRS,
  center: {
    x: 2682260.0,
    y: 1253708.0,
  },
  scale: 320_000,
  rotation: 0,
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
  predefinedInitialExtent: false,
  initialMapPadding: MapConstants.INITIAL_MAP_PADDING,
  initialMapPaddingMobile: MapConstants.INITIAL_MAP_PADDING_MOBILE,
  initialBoundingBox: MapConstants.KT_ZURICH_BOUNDING_BOX,
};
