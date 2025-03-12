import {MapService} from '../../map/interfaces/map.service';
import {ActiveMapItem} from '../../map/models/active-map-item.model';
import {ZoomType} from '../../shared/types/zoom.type';
import {TimeExtent} from '../../map/interfaces/time-extent.interface';
import {GeometryWithSrs, PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';
import {InternalDrawingLayer, UserDrawingLayer} from 'src/app/shared/enums/drawing-layer.enum';
import {Gb2WmsActiveMapItem} from '../../map/models/implementations/gb2-wms.model';
import {DrawingActiveMapItem} from '../../map/models/implementations/drawing.model';
import {ToolService} from '../../map/interfaces/tool.service';
import {WmsFilterValue} from '../../shared/interfaces/topic.interface';
import {DataDownloadSelectionTool} from '../../shared/types/data-download-selection-tool.type';
import {DrawingTool} from '../../shared/types/drawing-tool.type';
import {MeasurementTool} from '../../shared/types/measurement-tool.type';
import {
  Gb3StyledInternalDrawingRepresentation,
  Gb3StyleRepresentation,
} from '../../shared/interfaces/internal-drawing-representation.interface';
import {ExternalWmsActiveMapItem} from '../../map/models/implementations/external-wms.model';
import {ExternalKmlActiveMapItem} from '../../map/models/implementations/external-kml.model';

export class MapServiceStub implements MapService {
  private toolService: ToolService = {
    initializeDataDownloadSelection(selectionTool: DataDownloadSelectionTool) {},
    initializeDrawing(drawingTool: DrawingTool) {},
    initializeMeasurement(measurementTool: MeasurementTool) {},
    addExistingDrawingsToLayer(drawingsToAdd: Gb3StyledInternalDrawingRepresentation[], layerIdentifier: UserDrawingLayer) {},
    updateDrawingStyles(drawing: Gb3StyledInternalDrawingRepresentation, style: Gb3StyleRepresentation, labelText?: string) {},
    cancelTool() {},
    initializeElevationProfileMeasurement() {},
  };

  public addGeometryToInternalDrawingLayer(geometry: GeometryWithSrs, drawingLayer: InternalDrawingLayer): void {}

  public clearInternalDrawingLayer(drawingLayer: InternalDrawingLayer): void {}

  public addDrawingLayer(mapItem: DrawingActiveMapItem, position: number) {}

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

  public setTimeSliderExtent(timeSliderExtent: TimeExtent, mapItem: Gb2WmsActiveMapItem): void {}

  public setAttributeFilters(attributeFilterParameters: WmsFilterValue[], mapItem: Gb2WmsActiveMapItem): void {}

  public zoomToPoint(point: PointWithSrs, number: number): void {}

  public zoomToExtent(geometry: GeometryWithSrs, expandFactor?: number, duration?: number): void {}

  public addGb2WmsLayer(mapItem: Gb2WmsActiveMapItem, position: number): void {}

  public addExternalWmsLayer(mapItem: ExternalWmsActiveMapItem, position: number) {}

  public addExternalKmlLayer(mapItem: ExternalKmlActiveMapItem, position: number) {}

  public moveLayerToTop(mapItem: ActiveMapItem) {}

  public getToolService(): ToolService {
    return this.toolService;
  }

  public async startDrawPrintPreview(extentWidth: number, extentHeight: number, rotation: number) {}

  public stopDrawPrintPreview() {}

  public removeGeometryFromInternalDrawingLayer(drawingLayer: InternalDrawingLayer, id: string): void {}

  public cancelEditMode(): void {}
}
