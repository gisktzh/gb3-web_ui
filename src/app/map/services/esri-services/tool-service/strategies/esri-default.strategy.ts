import {EsriToolStrategy} from '../interfaces/strategy.interface';
import {UserDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import {SilentError} from '../../../../../shared/errors/abstract.errors';

/**
 * This is the default strategy which is assigned to the ToolService by default. It does not have any functionality and
 * raises an exception, which indicates that no actual strategy has been set.
 */
export class EsriDefaultStrategy implements EsriToolStrategy {
  public internalLayerType: UserDrawingLayer = UserDrawingLayer.Drawings;

  public start(): void {
    throw new EsriDefaultStrategyNotImplementedError();
  }

  public edit(graphic: __esri.Graphic) {
    throw new EsriDefaultStrategyNotImplementedError();
  }

  public cancel() {
    // This does not currently throw because we are calling the cancel-Method before setting a new strategy, which would crash the drawing tools
  }
}

export class EsriDefaultStrategyNotImplementedError extends SilentError {
  public override message = 'No strategy has been set for the ToolService.';
  public override name = 'EsriDefaultStrategyNotImplemented';
}
