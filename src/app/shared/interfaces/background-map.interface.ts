import {SupportedSrs} from '../types/supported-srs';

interface BasemapLayer {
  name: string;
}

/**
 * Each Basemap also should have a corresponding image in the assets/images/basemaps/ folder, named {mapId}.png.
 */
export interface Basemap {
  /**
   * Lowercase identifier for the given basemap.
   */
  id: string;
  /**
   * Path to the image that is shown in the widget, relative to the app root.
   */
  relativeImagePath: string;
  url: string;
  title: string;
  srsId: SupportedSrs;
  layers: BasemapLayer[];
}
