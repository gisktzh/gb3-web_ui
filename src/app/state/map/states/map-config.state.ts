export interface MapConfigState {
  center: {x: number; y: number};
  scale: number;
  srsId: number;
  ready: boolean;
  scaleSettings: {minScale: number; maxScale: number; calculatedMinScale: number; calculatedMaxScale: number};
  isMaxZoomedIn: boolean;
  isMaxZoomedOut: boolean;
  activeBasemapId: string;
  initialMaps: string[];
}
