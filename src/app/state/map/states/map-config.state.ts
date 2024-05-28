import {SupportedSrs} from '../../../shared/types/supported-srs.type';
import {Coordinates} from '../../../shared/interfaces/coordinate.interface';

export interface MapConfigState {
  isMapServiceInitialized: boolean;
  center: Coordinates;
  scale: number;
  rotation: number;
  srsId: SupportedSrs;
  ready: boolean;
  scaleSettings: {minScale: number; maxScale: number; calculatedMinScale: number; calculatedMaxScale: number};
  isMaxZoomedIn: boolean;
  isMaxZoomedOut: boolean;
  activeBasemapId: string;
  initialMaps: string[];
  calculateInitialExtent: boolean;
  initialMapPadding: {top: number; right: number; bottom: number; left: number};
  initialMapPaddingMobile: {top: number; right: number; bottom: number; left: number};
  zurichBoundingBox: {xmin: number; ymin: number; xmax: number; ymax: number};
}
