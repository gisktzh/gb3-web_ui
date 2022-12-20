export interface QueryLayer {
  topic: string;
  /**
   * Comma-separated list of layernames to be queried
   */
  layersToQuery: string;
}
