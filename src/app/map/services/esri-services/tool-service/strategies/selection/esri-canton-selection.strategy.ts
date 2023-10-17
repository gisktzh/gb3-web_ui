import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import {DataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';
import {UnstyledInternalDrawingRepresentation} from '../../../../../../shared/interfaces/internal-drawing-representation.interface';
import {AbstractEsriSelectionStrategy} from './abstract-esri-selection.strategy';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import {Observable, of} from 'rxjs';

export class EsriCantonSelectionStrategy extends AbstractEsriSelectionStrategy {
  protected createSelection(): Observable<DataDownloadSelection | undefined> {
    const selection: DataDownloadSelection = {
      type: 'select-canton',
      drawingRepresentation: this.createDrawingRepresentation(),
    };
    return of(selection);
  }

  protected drawSelection(selection: DataDownloadSelection): void {
    // TODO GB3-815 - Draw the canton as soon as the geometries are available and replace the following code
    const fakeCantonGeometry = new Polygon({
      rings: [
        [
          [2668968.6843831833, 1223858.2322834625],
          [2668968.6843831833, 1283351.7034120716],
          [2717123.999343813, 1283351.7034120716],
          [2717123.999343813, 1223858.2322834625],
        ],
      ],
      spatialReference: {wkid: 2056},
    });
    const graphic = new Graphic({geometry: fakeCantonGeometry, symbol: this.polygonSymbol});
    this.layer.add(graphic);
  }

  private createDrawingRepresentation(): UnstyledInternalDrawingRepresentation {
    // TODO GB3-815 - Get the exact drawing representation for the canton as soon as the geometries are available and replace the following
    // code
    return {
      type: 'Feature',
      properties: {},
      source: InternalDrawingLayer.Selection,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [2668968.6843831833, 1223858.2322834625],
            [2668968.6843831833, 1283351.7034120716],
            [2717123.999343813, 1283351.7034120716],
            [2717123.999343813, 1223858.2322834625],
          ],
        ],
        srs: 2056,
      },
    };
  }
}
