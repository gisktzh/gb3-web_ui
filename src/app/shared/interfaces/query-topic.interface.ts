export interface QueryTopic {
  topic: string;
  /**
   * Comma-separated list of layernames to be queried
   */
  layersToQuery: string;
  isSingleLayer: boolean;
}
