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
}
