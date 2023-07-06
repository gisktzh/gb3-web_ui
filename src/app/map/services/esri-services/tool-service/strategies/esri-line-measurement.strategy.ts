import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Polyline from '@arcgis/core/geometry/Polyline';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Graphic from '@arcgis/core/Graphic';
import {NumberUtils} from '../../../../../shared/utils/number.utils';
import {AbstractEsriMeasurementStrategy} from './abstract-esri-measurement.strategy';

const M_TO_KM_CONVERSION_THRESHOLD = 10_000;

export class EsriLineMeasurementStrategy extends AbstractEsriMeasurementStrategy {
  private readonly labelSymbolization: TextSymbol;

  constructor(
    layer: __esri.GraphicsLayer,
    mapView: __esri.MapView,
    polylineSymbol: __esri.SimpleLineSymbol,
    labelSymbolization: __esri.TextSymbol,
    callbackHandler: () => void
  ) {
    super(layer, mapView, callbackHandler);

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
        this.callbackHandler();
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
