import {EsriToolStrategy} from '../interfaces/strategy.interface';
import {InternalDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {SelectionCallbackHandler} from '../interfaces/selection-callback-handler.interface';
import {DataDownloadSelection} from '../../../../../shared/interfaces/data-download-selection.interface';
import {Observable, tap} from 'rxjs';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
import {geojsonToArcGIS} from '@terraformer/arcgis';
import {UnstyledInternalDrawingRepresentation} from '../../../../../shared/interfaces/internal-drawing-representation.interface';

export abstract class AbstractEsriSelectionStrategy implements EsriToolStrategy {
  public readonly internalLayerType: InternalDrawingLayer = InternalDrawingLayer.Selection;

  protected readonly layer: GraphicsLayer;
  protected readonly polygonSymbol: SimpleFillSymbol;
  protected readonly selectionCallbackHandler: SelectionCallbackHandler;

  constructor(layer: GraphicsLayer, polygonSymbol: SimpleFillSymbol, selectionCallbackHandler: SelectionCallbackHandler) {
    this.layer = layer;
    this.polygonSymbol = polygonSymbol;
    this.selectionCallbackHandler = selectionCallbackHandler;
  }

  public start() {
    // remove all old selections before starting a new one
    this.layer.removeAll();
    this.createSelection()
      .pipe(
        tap((selection) => {
          if (selection) {
            this.drawSelection(selection.drawingRepresentation);
            this.selectionCallbackHandler.complete(selection);
          } else {
            this.selectionCallbackHandler.abort();
          }
        }),
      )
      .subscribe();
  }

  public cancel() {
    this.layer.removeAll();
  }

  protected abstract createSelection(): Observable<DataDownloadSelection | undefined>;

  private drawSelection(drawingRepresentation: UnstyledInternalDrawingRepresentation) {
    const arcGisJsonRepresentation = geojsonToArcGIS(drawingRepresentation.geometry);
    const geometry = new Polygon({...arcGisJsonRepresentation, spatialReference: {wkid: drawingRepresentation.geometry.srs}});
    const graphic = new Graphic({geometry, symbol: this.polygonSymbol});
    this.layer.add(graphic);
  }
}
