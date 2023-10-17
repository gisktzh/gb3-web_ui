import {DataDownloadSelectMunicipalityDialogComponent} from '../../../../../components/data-download-select-municipality-dialog/data-download-select-municipality-dialog.component';
import {PanelClass} from '../../../../../../shared/enums/panel-class.enum';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {DataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {AbstractEsriSelectionStrategy} from './abstract-esri-selection.strategy';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
import {Municipality} from '../../../../../../shared/interfaces/geoshop-product.interface';
import {map} from 'rxjs/operators';
import {SelectionCallbackHandler} from '../../interfaces/selection-callback-handler.interface';
import {InternalDrawingRepresentation} from '../../../../../../shared/interfaces/internal-drawing-representation.interface';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';

export class EsriMunicipalitySelectionStrategy extends AbstractEsriSelectionStrategy {
  constructor(
    layer: GraphicsLayer,
    polygonSymbol: SimpleFillSymbol,
    selectionCallbackHandler: SelectionCallbackHandler,
    private readonly dialogService: MatDialog,
  ) {
    super(layer, polygonSymbol, selectionCallbackHandler);
  }

  protected createSelection(): Observable<DataDownloadSelection | undefined> {
    const dialog = this.dialogService.open<DataDownloadSelectMunicipalityDialogComponent, void, Municipality | undefined>(
      DataDownloadSelectMunicipalityDialogComponent,
      {
        panelClass: PanelClass.ApiWrapperDialog,
        restoreFocus: false,
      },
    );
    return dialog.afterClosed().pipe(
      map((municipality) => {
        if (municipality) {
          const drawingRepresentation = this.createDrawingRepresentation(municipality);
          return {
            type: 'select-municipality',
            drawingRepresentation: drawingRepresentation,
            municipality,
          };
        }
        return undefined;
      }),
    );
  }

  protected drawSelection(selection: DataDownloadSelection): void {
    // TODO GB3-815 - Draw the municipality as soon as the geometries are available and replace the following code
    const fakeMunicipalityGeometry = new Polygon({
      rings: [
        [
          [2676063.8520612405, 1241655.4830327919],
          [2676063.8520612405, 1254321.1722244308],
          [2689731.086018642, 1254321.1722244308],
          [2689731.086018642, 1241655.4830327919],
        ],
      ],
      spatialReference: {wkid: 2056},
    });
    const graphic = new Graphic({geometry: fakeMunicipalityGeometry, symbol: this.polygonSymbol});
    this.layer.add(graphic);
  }

  private createDrawingRepresentation(municipality: Municipality): InternalDrawingRepresentation {
    // TODO GB3-815 - Get the drawing representation for the municipality as soon as the geometries are available and replace the following code
    return {
      type: 'Feature',
      properties: {},
      source: InternalDrawingLayer.Selection,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [2676063.8520612405, 1241655.4830327919],
            [2676063.8520612405, 1254321.1722244308],
            [2689731.086018642, 1254321.1722244308],
            [2689731.086018642, 1241655.4830327919],
          ],
        ],
        srs: 2056,
      },
    };
  }
}
