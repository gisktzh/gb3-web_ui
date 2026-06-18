import {IsSingleLayer} from './single-layer.interface';
import {FilterConfiguration, TimeSliderConfiguration} from './topic.interface';
import {TimeExtent} from '../../map/interfaces/time-extent.interface';

export interface QueryTopic extends IsSingleLayer {
  topic: string;
  /**
   * Comma-separated list of layernames to be queried
   */
  layersToQuery: string;
  /**
   * Optional WMS filter configurations to send with feature info requests.
   */
  filterConfigurations?: FilterConfiguration[];
  /**
   * Optional time slider configuration to send as parameters for feature info requests.
   */
  timeSliderConfiguration?: TimeSliderConfiguration;
  /**
   * Optional currently active time slider extent to send as parameters for feature info requests.
   */
  timeSliderExtent?: TimeExtent;
}
