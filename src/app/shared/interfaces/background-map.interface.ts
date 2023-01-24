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
  url: string;
  title: string;
  srsId: number;
  layers: BasemapLayer[];
}
