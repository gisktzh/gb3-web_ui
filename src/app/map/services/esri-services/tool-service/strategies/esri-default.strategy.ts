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

  public edit(_: __esri.Graphic) {
    throw new EsriDefaultStrategyNotImplementedError();
  }

  public cancel() {
    throw new EsriDefaultStrategyNotImplementedError();
  }
}

export class EsriDefaultStrategyNotImplementedError extends SilentError {
  public override message = 'No strategy has been set for the ToolService.';
  public override name = 'EsriDefaultStrategyNotImplemented';
}
