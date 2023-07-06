import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Graphic from '@arcgis/core/Graphic';
import {AbstractEsriMeasurementStrategy} from './abstract-esri-measurement.strategy';
import Point from '@arcgis/core/geometry/Point';
import {NumberUtils} from '../../../../../shared/utils/number.utils';

export class EsriPointMeasurementStrategy extends AbstractEsriMeasurementStrategy {
  private readonly labelSymbolization: TextSymbol;

  constructor(
    layer: __esri.GraphicsLayer,
    mapView: __esri.MapView,
    pointSymbol: __esri.SimpleMarkerSymbol,
    labelSymbolization: __esri.TextSymbol,
    callbackHandler: () => void
  ) {
    super(layer, mapView, callbackHandler);

    this.sketchViewModel.pointSymbol = pointSymbol;
    this.labelSymbolization = labelSymbolization;
  }

  public end(): void {
    // todo: add logic for disabling the tool (if needed)
    console.log('ending');
  }

  public start(): void {
    this.sketchViewModel.create('point');
    this.sketchViewModel.on('create', (event) => {
      if (event.state === 'complete') {
        const geometry: Point = event.graphic.geometry as Point;

        // prepare symbolization
        this.labelSymbolization.text = this.getCoordinateString(geometry);
        const label = new Graphic({
          geometry: geometry,
          symbol: this.labelSymbolization
        });

        this.layer.addMany([label]);

        this.callbackHandler();
      }
    });
  }

  private getCoordinateString(geometry: __esri.Point) {
    return `${NumberUtils.roundToDecimals(geometry.x, 2)}/${NumberUtils.roundToDecimals(geometry.y, 2)}`;
  }
}
