import * as lengthOperator from '@arcgis/core/geometry/operators/lengthOperator.js';
import Polyline from '@arcgis/core/geometry/Polyline';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {NumberUtils} from '../../../../../../shared/utils/number.utils';
import {AbstractEsriMeasurementStrategy, LabelConfiguration} from '../abstract-esri-measurement.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';
import Point from '@arcgis/core/geometry/Point';
import {SupportedEsriTool} from '../supported-esri-tool.type';
import {LabelPositionCalculationFailed} from '../../../errors/esri.errors';

const M_TO_KM_CONVERSION_THRESHOLD = 10_000;

export class EsriLineMeasurementStrategy extends AbstractEsriMeasurementStrategy<Polyline, DrawingCallbackHandler['completeMeasurement']> {
  protected readonly tool: SupportedEsriTool = 'polyline';
  private readonly labelSymbolization: TextSymbol;

  constructor(
    layer: __esri.GraphicsLayer,
    mapView: __esri.MapView,
    polylineSymbol: __esri.SimpleLineSymbol,
    labelSymbolization: __esri.TextSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler['completeMeasurement'],
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    this.sketchViewModel.polylineSymbol = polylineSymbol;
    this.labelSymbolization = labelSymbolization;
  }

  protected override createLabelConfigurationForGeometry(geometry: Polyline): LabelConfiguration {
    this.labelSymbolization.text = this.getRoundedPolylineLengthString(geometry);
    const lastVertex = this.getLabelPosition(geometry);

    if (!lastVertex) {
      throw new LabelPositionCalculationFailed('Liniengeometrie ist ungültig, da kein Knotenpunkt gefunden werden konnte.');
    }

    return {location: lastVertex, symbolization: this.labelSymbolization};
  }

  private getLabelPosition(geometry: Polyline): Point | nullish {
    return geometry.getPoint(0, geometry.paths[0].length - 1);
  }

  private getRoundedPolylineLengthString(polyline: Polyline): string {
    let unit = 'm';
    let length = lengthOperator.execute(polyline, {unit: 'meters'});

    if (length > M_TO_KM_CONVERSION_THRESHOLD) {
      length = length / 1000;
      unit = 'km';
    }

    return `${NumberUtils.roundToDecimals(length, 2)} ${unit}`;
  }
}
