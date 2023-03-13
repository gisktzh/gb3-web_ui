import {MapService} from '../../map/interfaces/map.service';
import {Geometry} from 'geojson';
import {ActiveMapItem} from '../../map/models/active-map-item.model';
import {ZoomType} from '../../shared/types/zoom-type';
import {TimeExtent} from '../../map/interfaces/time-extent.interface';

export class MapServiceStub implements MapService {
  public addHighlightGeometry(geometry: Geometry): void {}

  public addMapItem(mapItem: ActiveMapItem): void {}

  public assignMapElement(container: HTMLDivElement): void {}

  public handleZoom(zoomType: ZoomType): void {}

  public init(): void {}

  public removeAllHighlightGeometries(): void {}

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
}
