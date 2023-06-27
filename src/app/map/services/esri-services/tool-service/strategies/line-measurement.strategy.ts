import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Polyline from '@arcgis/core/geometry/Polyline';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Graphic from '@arcgis/core/Graphic';
import {NumberUtils} from '../../../../../shared/utils/number.utils';
import {AbstractMeasurementStrategy} from './abstract-measurement.strategy';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';

export class LineMeasurementStrategy extends AbstractMeasurementStrategy {
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
        const length = this.getRoundedPolylineLength(geometry);

        // prepare symbolization
        this.labelSymbolization.text = `${length}m`;
        const label = new Graphic({
          geometry: geometry.getPoint(0, geometry.paths[0].length - 1),
          symbol: this.labelSymbolization
        });

        this.layer.addMany([label]);
      }
    });
  }

  private getRoundedPolylineLength(polyline: Polyline): number {
    const length = geometryEngine.planarLength(polyline, 'meters');
    return NumberUtils.roundToDecimals(length, 2);
  }
}
