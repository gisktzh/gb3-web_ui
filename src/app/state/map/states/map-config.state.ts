import {SupportedSrs} from '../../../shared/types/supported-srs.type';
import {Coordinate} from '../../../shared/interfaces/coordinate.interface';
import {MapViewPadding} from '../../../shared/interfaces/map-view-padding.interface';

export interface MapConfigState {
  isMapServiceInitialized: boolean;
  center: Coordinate;
  scale: number;
  rotation: number;
  srsId: SupportedSrs;
  ready: boolean;
  scaleSettings: {minScale: number; maxScale: number; calculatedMinScale: number; calculatedMaxScale: number};
  isMaxZoomedIn: boolean;
  isMaxZoomedOut: boolean;
  activeBasemapId: string;
  initialMaps: string[];
  predefinedInitialExtent: boolean;
  initialMapPadding: InitialMapPadding;
  initialMapPaddingMobile: InitialMapPadding;
  initialBoundingBox: BoundingBox;
  referenceDistanceInMeters: number | undefined;
}

export type InitialMapPadding = MapViewPadding;

export interface BoundingBox {
  min: Coordinate;
  max: Coordinate;
}
