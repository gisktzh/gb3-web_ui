import {Gb2WmsActiveMapItem} from '../models/active-map-item.model';

/**
 * Contains the logic for adding an item to the map. The MapService implements this interface and acts as a visitor
 * (variation of the pattern).
 *
 * todo: to make the visitor pattern complete, the visitor should be an object that handles the logic; but this also
 * requires a cleaner separation in the add method
 */
export interface AddToMapVisitor {
  /** Adds a new item to the map in the given position (0 is the topmost item - the most visible one)  */
  addGb2WmsLayer(mapItem: Gb2WmsActiveMapItem, position: number): void;
}
