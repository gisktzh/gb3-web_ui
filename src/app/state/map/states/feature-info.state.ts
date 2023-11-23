import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {FeatureInfoQueryLocation, FeatureInfoResult} from '../../../shared/interfaces/feature-info.interface';
import {GeometryWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';

export interface FeatureInfoState extends HasLoadingState {
  queryLocation: FeatureInfoQueryLocation;
  data: FeatureInfoResult[];
  highlightedFeature: GeometryWithSrs | undefined;
  pinnedFeatureId: string | undefined;
}
