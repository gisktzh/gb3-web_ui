import {SupportedSrs} from '../../../shared/types/supported-srs.type';
import {Coordinate} from '../../../shared/interfaces/coordinate.interface';

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
}

export interface InitialMapPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BoundingBox {
  min: Coordinate;
  max: Coordinate;
}
