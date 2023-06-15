import {ActiveMapItem, Gb2WmsActiveMapItem} from '../models/active-map-item.model';
import {ZoomType} from '../../shared/types/zoom-type';
import {TimeExtent} from './time-extent.interface';
import {GeometryWithSrs, PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';
import {DrawingLayer} from '../../shared/enums/drawing-layer.enum';

/**
 * Contains the logic for adding an item to the map. The MapService implements this interface and acts as a visitor (variation of the
 * pattern).
 *
 * todo: to make the visitor pattern complete, the visitor should be an object that handles the logic; but this also requires a cleaner
 * separation in the add method
 */
export interface AddToMapVisitor {
  /** Adds a new item to the map in the given position (0 is the topmost item - the most visible one)  */
  addGb2WmsLayer(mapItem: Gb2WmsActiveMapItem, position: number): void;
}

export interface MapService extends AddToMapVisitor {
  /** Initializes the map by creating the initial background map and with a given extent */
  init(): void;

  /** Assigns the map to an element on the HTML */
  assignMapElement(container: HTMLDivElement): void;

  /** Sets the scale of the whole map */
  setScale(scale: number): void;

  /** Sets the map center point */
  setMapCenter(center: PointWithSrs): void;

  /** Resets the extent of the map to the initial extent */
  resetExtent(): void;

  /** Triggers a zoomevent, which is either zooming in or out */
  handleZoom(zoomType: ZoomType): void;

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

  /** Sets the time slider extent for an existing item on the map */
  setTimeSliderExtent(timeExtent: TimeExtent, mapItem: Gb2WmsActiveMapItem): void; // todo: make gb2 specific

  /** Sets the attribute filters for an existing item on the map */
  setAttributeFilters(
    attributeFilterParameters: {name: string; value: string}[],
    mapItem: Gb2WmsActiveMapItem // todo: make gb2 specific
  ): void;

  /** Reorders a map item using its old index (previous) and the new index (current); 0 is the topmost item - the most visible one */
  reorderMapItem(previousPosition: number, currentPosition: number): void;

  /** Reorders a sublayer within a map item using its old index (previous) and the new index (current); 0 is the topmost layer - the most visible one */
  reorderSublayer(mapItem: ActiveMapItem, previousPosition: number, currentPosition: number): void;

  /** Zooms to a selected point based on latitude, longitude, Srs and scale */
  zoomToPoint(point: PointWithSrs, scale: number): void;

  /** Zooms to the extent of a given geometry */
  zoomToExtent(geometry: GeometryWithSrs): void;

  /** Adds a geometry to a DrawingLayer */
  addGeometryToDrawingLayer(geometry: GeometryWithSrs, drawingLayer: DrawingLayer): void;

  /** Clears all geometries from a DrawingLayer */
  clearDrawingLayer(drawingLayer: DrawingLayer): void;
}
