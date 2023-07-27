import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {FeatureInfoResponse} from '../../../shared/interfaces/feature-info.interface';
import {GeometryWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';

export const FeatureInfoActions = createActionGroup({
  source: 'FeatureInfo',
  events: {
    'Send Request': props<{x: number; y: number}>(),
    'Update Content': props<{featureInfos: FeatureInfoResponse[]}>(),
    'Clear Content': emptyProps(),
    'Highlight Feature': props<{feature: GeometryWithSrs; pinnedFeatureId: string | undefined}>(),
    'Clear Highlight': emptyProps(),
    'Set Error': emptyProps(),
  },
});
