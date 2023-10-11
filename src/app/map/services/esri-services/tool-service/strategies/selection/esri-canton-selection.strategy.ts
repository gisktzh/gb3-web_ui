import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import {DataDownloadActions} from '../../../../../../state/map/actions/data-download.actions';
import {DataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';
import {InternalDrawingRepresentation} from '../../../../../../shared/interfaces/internal-drawing-representation.interface';
import {AbstractEsriSelectionStrategy} from './abstract-esri-selection.strategy';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {Store} from '@ngrx/store';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';

export class EsriCantonSelectionStrategy extends AbstractEsriSelectionStrategy {
  constructor(layer: GraphicsLayer, polygonSymbol: SimpleFillSymbol, store: Store) {
    super(layer, polygonSymbol, store);
  }

  public start(): void {
    const drawingRepresentation = this.createDrawingRepresentation();
    this.drawRepresentationOnMap(drawingRepresentation);
    this.dispatchSetSelection(drawingRepresentation);
  }

  private dispatchSetSelection(drawingRepresentation: InternalDrawingRepresentation) {
    const selection: DataDownloadSelection = {
      type: 'select-canton',
      drawingRepresentation: drawingRepresentation,
    };
    this.store.dispatch(DataDownloadActions.setSelection({selection}));
  }

  private drawRepresentationOnMap(drawingRepresentation: InternalDrawingRepresentation) {
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

  private createDrawingRepresentation(): InternalDrawingRepresentation {
    // TODO GB3-815 - Get the exact drawing representation for the canton as soon as the geometries are available and replace the following code
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
