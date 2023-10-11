import {EsriToolStrategy} from '../../interfaces/strategy.interface';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {Store} from '@ngrx/store';

export abstract class AbstractEsriSelectionStrategy implements EsriToolStrategy {
  public readonly internalLayerType: InternalDrawingLayer = InternalDrawingLayer.Selection;

  protected constructor(
    protected readonly layer: GraphicsLayer,
    protected readonly polygonSymbol: SimpleFillSymbol,
    protected readonly store: Store,
  ) {}

  public abstract start(): void;

  public cancel(): void {
    this.layer.removeAll();
  }
}
