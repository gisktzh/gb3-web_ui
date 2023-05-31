import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {FeatureInfoResult} from '../../../shared/interfaces/feature-info.interface';
import {GeometryWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';

export interface FeatureInfoState extends HasLoadingState {
  data: FeatureInfoResult[];
  highlightedFeature: GeometryWithSrs | undefined;
  pinnedFeatureId: string | undefined;
}
