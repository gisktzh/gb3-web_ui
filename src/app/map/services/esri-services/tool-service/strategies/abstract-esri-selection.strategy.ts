import {EsriToolStrategy} from '../interfaces/strategy.interface';
import {InternalDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {DataDownloadSelection} from '../../../../../shared/interfaces/data-download-selection.interface';
import {Observable} from 'rxjs';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
import {geojsonToArcGIS} from '@terraformer/arcgis';
import {UnstyledInternalDrawingRepresentation} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {DrawingCallbackHandler} from '../interfaces/drawing-callback-handler.interface';

export abstract class AbstractEsriSelectionStrategy<T extends DrawingCallbackHandler['completeSelection']> implements EsriToolStrategy {
  public readonly internalLayerType: InternalDrawingLayer = InternalDrawingLayer.Selection;

  protected readonly layer: GraphicsLayer;
  protected readonly polygonSymbol: SimpleFillSymbol;
  protected readonly completeCallbackHandler: T;

  constructor(layer: GraphicsLayer, polygonSymbol: SimpleFillSymbol, completeCallbackHandler: T) {
    this.layer = layer;
    this.polygonSymbol = polygonSymbol;
    this.completeCallbackHandler = completeCallbackHandler;
  }

  public start() {
    // remove all old selections before starting a new one
    this.layer.removeAll();
    this.createSelection().subscribe((selection) => {
      if (selection) {
        this.drawSelection(selection.drawingRepresentation);
      }
      this.completeCallbackHandler(selection);
    });
  }

  public cancel() {
    this.layer.removeAll();
  }

  public edit(_: Graphic) {
    // currently, editing is not supported for selection strategies
  }

  protected abstract createSelection(): Observable<DataDownloadSelection | undefined>;

  private drawSelection(drawingRepresentation: UnstyledInternalDrawingRepresentation) {
    const arcGisJsonRepresentation = geojsonToArcGIS(drawingRepresentation.geometry);
    const geometry = new Polygon({...arcGisJsonRepresentation, spatialReference: {wkid: drawingRepresentation.geometry.srs}});
    const graphic = new Graphic({geometry, symbol: this.polygonSymbol});
    this.layer.add(graphic);
  }
}
