import {ActiveMapItem} from '../models/active-map-item.model';
import {ZoomType} from '../../shared/types/zoom-type';
import {TimeExtent} from './time-extent.interface';
import {GeometryWithSrs, PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';
import {InternalDrawingLayer} from '../../shared/enums/drawing-layers.enum';
import {AddToMapVisitor} from './add-to-map.visitor';
import {Gb2WmsActiveMapItem} from '../models/implementations/gb2-wms.model';

export interface MapService extends AddToMapVisitor {
  /** Initializes the map by creating the initial background map and with a given extent */
  init(): void;

  /** Assigns the map to an element on the HTML */
  assignMapElement(container: HTMLDivElement): void;

  /** Assigns the scale bar to an element on the HTML */
  assignScaleBarElement(container: HTMLDivElement): void;

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
  setTimeSliderExtent(timeExtent: TimeExtent, mapItem: Gb2WmsActiveMapItem): void;

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
  addGeometryToDrawingLayer(geometry: GeometryWithSrs, drawingLayer: InternalDrawingLayer): void;

  /** Clears all geometries from a DrawingLayer */
  clearDrawingLayer(drawingLayer: InternalDrawingLayer): void;
}
