import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {Geometry} from 'geojson';
import {FeatureInfoResponse} from '../../../shared/interfaces/feature-info.interface';

export const FeatureInfoActions = createActionGroup({
  source: 'FeatureInfo',
  events: {
    'Send Request': props<{x: number; y: number}>(),
    'Update Feature Info': props<{featureInfos: FeatureInfoResponse[]}>(),
    'Clear Feature Info Content': emptyProps(),
    'Highlight Feature': props<{feature: Geometry; isPinned: boolean}>(),
    'Clear Highlight': emptyProps()
  }
});
