import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {GeometryWithSrs, PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {StatisticsResult} from '../../../shared/interfaces/statistics.interface';
import {StatisticsMode} from '../../../shared/types/statistics-mode.type';

export const StatisticsActions = createActionGroup({
  source: 'Statistics',
  events: {
    /** The area to query was defined, either by drawing it or by deriving it from a point. */
    'Set Selection': props<{
      geometry: GeometryWithSrs;
      center: PointWithSrs | undefined;
      /** Set when the area itself dictates the radius, i.e. after drawing a circle; undefined keeps the current radius. */
      radiusInMeters: number | undefined;
    }>(),
    'Set Mode': props<{mode: StatisticsMode}>(),
    'Set Radius': props<{radiusInMeters: number}>(),
    'Send Request': emptyProps(),
    'Update Content': props<{results: StatisticsResult[]}>(),
    'Clear Content': emptyProps(),
    'Set Error': errorProps(),
  },
});
