import {EsriToolStrategy} from '../../interfaces/strategy.interface';
import {UserDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';

/**
 * This is the default strategy which is assigned to the ToolService by default. It does not have any functionality and
 * raises an exception, which indicates that no actual strategy has been set.
 */
export class EsriDefaultStrategy implements EsriToolStrategy {
  public internalLayerType: UserDrawingLayer = UserDrawingLayer.Drawings;

  public start(): void {
    throw Error('Default Strategy is not implemented.');
  }

  public cancel() {
    throw Error('Default Strategy is not implemented.');
  }
}
