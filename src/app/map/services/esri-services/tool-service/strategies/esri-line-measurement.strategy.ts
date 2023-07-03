import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Polyline from '@arcgis/core/geometry/Polyline';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Graphic from '@arcgis/core/Graphic';
import {NumberUtils} from '../../../../../shared/utils/number.utils';
import {AbstractEsriMeasurementStrategy} from './abstract-esri-measurement.strategy';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';

const M_TO_KM_CONVERSION_THRESHOLD = 10_000;
export class EsriLineMeasurementStrategy extends AbstractEsriMeasurementStrategy {
  private readonly labelSymbolization: TextSymbol;

  constructor(layer: GraphicsLayer, mapView: MapView, polylineSymbol: __esri.SimpleLineSymbol, labelSymbolization: TextSymbol) {
    super(layer, mapView);

    this.sketchViewModel.polylineSymbol = polylineSymbol;
    this.labelSymbolization = labelSymbolization;
  }

  public end(): void {
    // todo: add logic for disabling the tool (if needed)
    console.log('ending');
  }

  public start(): void {
    this.sketchViewModel.create('polyline');
    this.sketchViewModel.on('create', (event) => {
      if (event.state === 'complete') {
        const geometry: Polyline = event.graphic.geometry as Polyline;
        const lengthString = this.getRoundedPolylineLengthString(geometry);

        // prepare symbolization
        this.labelSymbolization.text = lengthString;
        const label = new Graphic({
          geometry: geometry.getPoint(0, geometry.paths[0].length - 1),
          symbol: this.labelSymbolization
        });

        this.layer.addMany([label]);
      }
    });
  }

  private getRoundedPolylineLengthString(polyline: Polyline): string {
    let unit = 'm';
    let length = geometryEngine.planarLength(polyline, 'meters');

    if (length > M_TO_KM_CONVERSION_THRESHOLD) {
      length = length / 1000;
      unit = 'km';
    }

    return `${NumberUtils.roundToDecimals(length, 2)} ${unit}`;
  }
}
