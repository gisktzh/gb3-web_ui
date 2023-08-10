import {SupportedSrs} from '../types/supported-srs.type';

interface BasemapLayer {
  name: string;
}

interface AbstractBasemap {
  /**
   * Lowercase identifier for the given basemap.
   */
  id: string;
  type: 'wms' | 'blank';
  title: string;
}

export type Basemap = WmsBasemap | BlankBasemap;

export interface BlankBasemap extends AbstractBasemap {
  type: 'blank';
}

/**
 * Each WmsBasemap should have a corresponding image in the assets/images/basemaps/ folder, named {mapId}.png.
 */
export interface WmsBasemap extends AbstractBasemap {
  type: 'wms';
  /**
   * Path to the image that is shown in the widget, relative to the app root.
   */
  relativeImagePath: string;
  url: string;
  layers: BasemapLayer[];
  srsId: SupportedSrs;
}
