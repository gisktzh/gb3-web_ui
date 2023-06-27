import {EsriToolStrategy} from '../interfaces/strategy.interface';

export class DefaultStrategy implements EsriToolStrategy {
  public start() {
    throw Error('Default Strategy is not implemented.');
  }

  public end() {
    throw Error('Default Strategy is not implemented.');
  }
}
