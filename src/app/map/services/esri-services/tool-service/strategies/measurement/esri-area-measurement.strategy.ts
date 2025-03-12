import * as areaOperator from '@arcgis/core/geometry/operators/areaOperator.js';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {NumberUtils} from '../../../../../../shared/utils/number.utils';
import {AbstractEsriMeasurementStrategy, LabelConfiguration} from '../abstract-esri-measurement.strategy';
import Polygon from '@arcgis/core/geometry/Polygon';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';
import Point from '@arcgis/core/geometry/Point';
import {SupportedEsriPolygonTool} from '../supported-esri-tool.type';
import {LabelPositionCalculationFailed} from '../../../errors/esri.errors';

const M2_TO_KM2_CONVERSION_THRESHOLD = 100_000;

export class EsriAreaMeasurementStrategy extends AbstractEsriMeasurementStrategy<Polygon, DrawingCallbackHandler['completeMeasurement']> {
  protected readonly tool: SupportedEsriPolygonTool;
  private readonly labelSymbolization: TextSymbol;

  constructor(
    layer: GraphicsLayer,
    mapView: MapView,
    polygonSymbol: SimpleFillSymbol,
    labelSymbolization: TextSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler['completeMeasurement'],
    polygonType: SupportedEsriPolygonTool,
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    this.tool = polygonType;
    this.sketchViewModel.polygonSymbol = polygonSymbol;
    this.labelSymbolization = labelSymbolization;
  }

  protected override createLabelConfigurationForGeometry(geometry: Polygon): LabelConfiguration {
    this.labelSymbolization.text = this.getRoundedPolygonAreaString(geometry);

    const labelPosition = this.getLabelPosition(geometry);

    if (!labelPosition) {
      throw new LabelPositionCalculationFailed('Kein Zentroid vorhanden.');
    }

    return {location: labelPosition, symbolization: this.labelSymbolization};
  }

  private getLabelPosition(geometry: Polygon): Point | nullish {
    return geometry.centroid;
  }

  /**
   * Returns the area string of the given polygon, rounded to two decimals and converted to km2 if it is larger than
   * the defined threshold in M2_TO_KM2_CONVERSION_THRESHOLD.
   * @param polygon
   * @private
   */
  private getRoundedPolygonAreaString(polygon: Polygon): string {
    let unit = 'm²';
    let area = Math.abs(areaOperator.execute(polygon, {unit: 'square-meters'}));

    if (area > M2_TO_KM2_CONVERSION_THRESHOLD) {
      area = area / 1_000_000;
      unit = 'km²';
    }

    return `${NumberUtils.roundToDecimals(area, 2)} ${unit}`;
  }
}
