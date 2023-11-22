import {SingleLayer} from './single-layer.interface';

export interface QueryTopic extends SingleLayer {
  topic: string;
  /**
   * Comma-separated list of layernames to be queried
   */
  layersToQuery: string;
}
