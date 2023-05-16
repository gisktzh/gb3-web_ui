import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {FeatureInfoResponse} from '../../../shared/interfaces/feature-info.interface';
import {GeometryWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';

export const FeatureInfoActions = createActionGroup({
  source: 'FeatureInfo',
  events: {
    'Send Request': props<{x: number; y: number}>(),
    'Update Feature Info': props<{featureInfos: FeatureInfoResponse[]}>(),
    'Clear Feature Info Content': emptyProps(),
    'Highlight Feature': props<{feature: GeometryWithSrs; isPinned: boolean}>(),
    'Clear Highlight': emptyProps()
  }
});
