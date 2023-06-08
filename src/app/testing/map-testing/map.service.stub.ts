import {MapService} from '../../map/interfaces/map.service';
import {ActiveMapItem} from '../../map/models/active-map-item.model';
import {ZoomType} from '../../shared/types/zoom-type';
import {TimeExtent} from '../../map/interfaces/time-extent.interface';
import {GeometryWithSrs, PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';
import {DrawingLayer} from 'src/app/shared/enums/drawing-layer.enum';

export class MapServiceStub implements MapService {
  addGeometryToDrawingLayer(geometry: GeometryWithSrs, drawingLayer: DrawingLayer): void {}

  clearDrawingLayer(drawingLayer: DrawingLayer): void {}

  public addMapItem(mapItem: ActiveMapItem): void {}

  public assignMapElement(container: HTMLDivElement): void {}

  public handleZoom(zoomType: ZoomType): void {}

  public setMapCenter(center: PointWithSrs): void {}

  public init(): void {}

  public removeAllMapItems(): void {}

  public removeMapItem(id: string): void {}

  public reorderMapItem(previousPosition: number, currentPosition: number): void {}

  public reorderSublayer(mapItem: ActiveMapItem, previousPosition: number, currentPosition: number): void {}

  public resetExtent(): void {}

  public setOpacity(opacity: number, mapItem: ActiveMapItem): void {}

  public setScale(scale: number): void {}

  public setSublayerVisibility(visibility: boolean, mapItem: ActiveMapItem, layerId: number): void {}

  public setVisibility(visibility: boolean, mapItem: ActiveMapItem): void {}

  public setTimeSliderExtent(timeSliderExtent: TimeExtent, mapItem: ActiveMapItem): void {}

  public setAttributeFilters(attributeFilterParameters: {name: string; value: string}[], mapItem: ActiveMapItem): void {}

  public zoomToPoint(point: PointWithSrs, number: number): void {}

  public zoomToExtent(geometry: GeometryWithSrs): void {}
}
