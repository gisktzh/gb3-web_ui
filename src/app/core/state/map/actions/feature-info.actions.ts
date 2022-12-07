import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {TopicsFeatureInfoDetailData} from '../../../../shared/models/gb3-api-generated.interfaces';

export const FeatureInfoActions = createActionGroup({
  source: 'FeatureInfo',
  events: {
    'Send Request': props<{x: number; y: number}>(),
    'Update Feature Info': props<{featureInfos: TopicsFeatureInfoDetailData[]}>(),
    'Clear Feature Info Content': emptyProps()
  }
});
