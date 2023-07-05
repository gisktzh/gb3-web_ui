import {EsriToolStrategy} from '../interfaces/strategy.interface';

/**
 * This is the default strategy which is assigned to the ToolService by default. It does not have any functionality and
 * raises an exception, which indicates that no actual strategy has been set.
 */
export class EsriDefaultStrategy implements EsriToolStrategy {
  public start(endDrawing: () => void): void {
    throw Error('Default Strategy is not implemented.');
  }

  public end() {
    throw Error('Default Strategy is not implemented.');
  }
}
