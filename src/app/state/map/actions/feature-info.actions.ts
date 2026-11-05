import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {FeatureInfoResponse} from '../../../shared/interfaces/feature-info.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {GeometryWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {Coordinate} from '../../../shared/interfaces/coordinate.interface';
import {FeatureHighlightSource} from '../../../shared/interfaces/feature-highlight.interface';

export const FeatureInfoActions = createActionGroup({
  source: 'FeatureInfo',
  events: {
    'Send Request': props<Coordinate & {scale: number}>(),
    'Update Content': props<{featureInfos: FeatureInfoResponse[]}>(),
    'Clear Content': emptyProps(),
    'Highlight Feature': props<{feature: GeometryWithSrs; source: FeatureHighlightSource; pinnedFeatureId: string | undefined}>(),
    'Clear Highlight': emptyProps(),
    'Set Error': errorProps(),
  },
});
