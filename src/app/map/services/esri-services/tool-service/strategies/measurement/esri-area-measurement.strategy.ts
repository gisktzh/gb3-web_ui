import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {NumberUtils} from '../../../../../../shared/utils/number.utils';
import {AbstractEsriMeasurementStrategy, LabelConfiguration} from '../abstract-esri-measurement.strategy';
import Polygon from '@arcgis/core/geometry/Polygon';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import {SupportedEsriTool} from '../abstract-esri-drawable-tool.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';
import Point from '@arcgis/core/geometry/Point';

const M2_TO_KM2_CONVERSION_THRESHOLD = 100_000;

export class EsriAreaMeasurementStrategy extends AbstractEsriMeasurementStrategy<Polygon> {
  protected readonly tool: SupportedEsriTool = 'polygon';
  private readonly labelSymbolization: TextSymbol;

  constructor(
    layer: GraphicsLayer,
    mapView: MapView,
    polygonSymbol: SimpleFillSymbol,
    labelSymbolization: TextSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler['complete'],
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    this.sketchViewModel.polygonSymbol = polygonSymbol;
    this.labelSymbolization = labelSymbolization;
  }

  public static getLabelPosition(geometry: Polygon): Point {
    return geometry.centroid;
  }

  protected override createLabelConfigurationForGeometry(geometry: Polygon): LabelConfiguration {
    this.labelSymbolization.text = this.getRoundedPolygonAreaString(geometry);

    return {location: EsriAreaMeasurementStrategy.getLabelPosition(geometry), symbolization: this.labelSymbolization};
  }

  /**
   * Returns the area string of the given polygon, rounded to two decimals and converted to km2 if it is larger than
   * the defined threshold in M2_TO_KM2_CONVERSION_THRESHOLD.
   * @param polygon
   * @private
   */
  private getRoundedPolygonAreaString(polygon: Polygon): string {
    let unit = 'm²';
    let length = geometryEngine.planarArea(polygon, 'square-meters');

    if (length > M2_TO_KM2_CONVERSION_THRESHOLD) {
      length = length / 1_000_000;
      unit = 'km²';
    }

    return `${NumberUtils.roundToDecimals(length, 2)} ${unit}`;
  }
}
