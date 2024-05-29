import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {FeatureInfoResponse} from '../../../shared/interfaces/feature-info.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {GeometryWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {Coordinate} from '../../../shared/interfaces/coordinate.interface';

export const FeatureInfoActions = createActionGroup({
  source: 'FeatureInfo',
  events: {
    'Send Request': props<Coordinate>(),
    'Update Content': props<{featureInfos: FeatureInfoResponse[]}>(),
    'Clear Content': emptyProps(),
    'Highlight Feature': props<{feature: GeometryWithSrs; pinnedFeatureId: string | undefined}>(),
    'Clear Highlight': emptyProps(),
    'Set Error': errorProps(),
  },
});
