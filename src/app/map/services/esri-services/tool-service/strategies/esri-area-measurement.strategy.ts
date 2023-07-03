import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Graphic from '@arcgis/core/Graphic';
import {NumberUtils} from '../../../../../shared/utils/number.utils';
import {AbstractEsriMeasurementStrategy} from './abstract-esri-measurement.strategy';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import Polygon from '@arcgis/core/geometry/Polygon';

const M2_TO_KM2_CONVERSION_THRESHOLD = 100_000;
export class EsriAreaMeasurementStrategy extends AbstractEsriMeasurementStrategy {
  private readonly labelSymbolization: TextSymbol;

  constructor(layer: GraphicsLayer, mapView: MapView, polygonSymbol: __esri.SimpleFillSymbol, labelSymbolization: TextSymbol) {
    super(layer, mapView);

    this.sketchViewModel.polygonSymbol = polygonSymbol;
    this.labelSymbolization = labelSymbolization;
  }

  public end(): void {
    // todo: add logic for disabling the tool (if needed)
    console.log('ending');
  }

  public start(): void {
    this.sketchViewModel.create('polygon');
    this.sketchViewModel.on('create', (event) => {
      if (event.state === 'complete') {
        const geometry: Polygon = event.graphic.geometry as Polygon;
        const areaString = this.getRoundedPolygonAreaString(geometry);

        // prepare symbolization
        this.labelSymbolization.text = areaString;
        const label = new Graphic({
          geometry: geometry.centroid,
          symbol: this.labelSymbolization
        });

        this.layer.addMany([label]);
      }
    });
  }

  /**
   * Returns the area string of the given polygon, rounded to two decimals and converted to km2 if it is larger than the defined
   * threshold in M2_TO_KM2_CONVERSION_THRESHOLD.
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
