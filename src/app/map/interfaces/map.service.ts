import {Geometry} from 'geojson';
import {ActiveMapItem} from '../models/active-map-item.model';

export interface MapService {
  /** Initializes the map by creating the initial background map and with a given extent */
  init(): void;
  /** Assigns the map to an element on the HTML */
  assignMapElement(container: HTMLDivElement): void;

  /** Adds a new item to the map */
  addMapItem(mapItem: ActiveMapItem): void;
  /** Removes an existing item from the map given its unique ID */
  removeMapItem(id: string): void;
  /** Removes all existing items from the map */
  removeAllMapItems(): void;

  /** Sets the opacity for an existing item on the map */
  setOpacity(opacity: number, mapItem: ActiveMapItem): void;

  /** Sets the visibility for an existing item on the map */
  setVisibility(visibility: boolean, mapItem: ActiveMapItem): void;
  /** Sets the visibility for a sublayer of an existing item on the map */
  setSublayerVisibility(visibility: boolean, mapItem: ActiveMapItem, layerId: number): void;

  /** Reorders a map item using its old index (previous) and the new index (current) */
  reorderMapItem(previousIndex: number, currentIndex: number): void;
  /** Reorders a sublayer within a map item using its old index (previous) and the new index (current) */
  reorderSublayer(mapItem: ActiveMapItem, previousIndex: number, currentIndex: number): void;

  /** Adds a new highlight geometry to the map */
  addHighlightGeometry(geometry: Geometry): void;
  /** Removes an existing highlight geometry from the map */
  removeAllHighlightGeometries(): void;
}
