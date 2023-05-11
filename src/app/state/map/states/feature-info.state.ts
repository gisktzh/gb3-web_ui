import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {FeatureInfoResult} from '../../../shared/interfaces/feature-info.interface';
import {Geometry} from 'geojson';

export interface FeatureInfoState extends HasLoadingState {
  data: FeatureInfoResult[];
  highlightedFeature: Geometry | undefined;
  isPinned: boolean;
}
