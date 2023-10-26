import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {AbstractEsriMeasurementStrategy, LabelConfiguration} from './abstract-esri-measurement.strategy';
import Point from '@arcgis/core/geometry/Point';
import {NumberUtils} from '../../../../../../shared/utils/number.utils';
import {SupportedEsriTool} from '../abstract-esri-drawable-tool.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';

export class EsriPointMeasurementStrategy extends AbstractEsriMeasurementStrategy<Point> {
  protected readonly tool: SupportedEsriTool = 'point';
  private readonly labelSymbolization: TextSymbol;

  constructor(
    layer: __esri.GraphicsLayer,
    mapView: __esri.MapView,
    pointSymbol: __esri.SimpleMarkerSymbol,
    labelSymbolization: __esri.TextSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler['complete'],
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    this.sketchViewModel.pointSymbol = pointSymbol;
    this.labelSymbolization = labelSymbolization;
  }

  public static getLabelPosition(geometry: Point): Point {
    return geometry;
  }

  protected override createLabelConfigurationForGeometry(geometry: Point): LabelConfiguration {
    this.labelSymbolization.text = this.getCoordinateString(geometry);

    return {location: EsriPointMeasurementStrategy.getLabelPosition(geometry), symbolization: this.labelSymbolization};
  }

  private getCoordinateString(geometry: __esri.Point) {
    return `${NumberUtils.roundToDecimals(geometry.x, 2)}/${NumberUtils.roundToDecimals(geometry.y, 2)}`;
  }
}
