import {IsSingleLayer} from './single-layer.interface';

export interface QueryTopic extends IsSingleLayer {
  topic: string;
  /**
   * Comma-separated list of layernames to be queried
   */
  layersToQuery: string;
}
