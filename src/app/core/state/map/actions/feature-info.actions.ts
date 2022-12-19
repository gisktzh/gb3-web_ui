import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {FeatureInfoResponse} from '../../../../shared/models/gb3-api.interfaces';
import {Geometry} from 'geojson';

export const FeatureInfoActions = createActionGroup({
  source: 'FeatureInfo',
  events: {
    'Send Request': props<{x: number; y: number}>(),
    'Update Feature Info': props<{featureInfos: FeatureInfoResponse[]}>(),
    'Clear Feature Info Content': emptyProps(),
    'Highlight Feature': props<{feature: Geometry}>()
  }
});
