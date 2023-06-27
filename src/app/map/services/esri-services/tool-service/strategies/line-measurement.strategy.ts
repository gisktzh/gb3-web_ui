import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Polyline from '@arcgis/core/geometry/Polyline';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Graphic from '@arcgis/core/Graphic';
import {NumberUtils} from '../../../../../shared/utils/number.utils';
import {AbstractMeasurementStrategy} from './abstract-measurement.strategy';
import TextSymbolProperties = __esri.TextSymbolProperties;

const MEASUREMENT_LABEL: TextSymbolProperties = {
  color: '#FF0000',
  verticalAlignment: 'bottom',
  yoffset: -12,
  haloColor: '#FFFFFF',
  haloSize: 2
};

export class LineMeasurementStrategy extends AbstractMeasurementStrategy {
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
        const txtSymbol = new TextSymbol({
          ...MEASUREMENT_LABEL,
          text: `${length}m`
        });
        const label = new Graphic({
          geometry: geometry.getPoint(0, geometry.paths[0].length - 1),
          symbol: txtSymbol
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
