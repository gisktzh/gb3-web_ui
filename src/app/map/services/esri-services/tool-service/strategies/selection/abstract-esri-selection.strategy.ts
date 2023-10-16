import {EsriToolStrategy} from '../../interfaces/strategy.interface';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {SelectionCallbackHandler} from '../../interfaces/selection-callback-handler.interface';
import {DataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';
import {Observable, tap} from 'rxjs';

export abstract class AbstractEsriSelectionStrategy implements EsriToolStrategy {
  public readonly internalLayerType: InternalDrawingLayer = InternalDrawingLayer.Selection;

  constructor(
    protected readonly layer: GraphicsLayer,
    protected readonly polygonSymbol: SimpleFillSymbol,
    protected readonly selectionCallbackHandler: SelectionCallbackHandler,
  ) {}

  public start() {
    // remove all old selections before starting a new one
    this.layer.removeAll();
    this.createSelection()
      .pipe(
        tap((selection) => {
          if (selection) {
            this.drawSelection(selection);
            this.selectionCallbackHandler.complete(selection);
          } else {
            this.selectionCallbackHandler.abort();
          }
        }),
      )
      .subscribe();
  }

  public cancel(): void {
    this.layer.removeAll();
  }

  protected abstract createSelection(): Observable<DataDownloadSelection | undefined>;
  protected abstract drawSelection(selection: DataDownloadSelection): void;
}
