import {createActionGroup, props} from '@ngrx/store';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';

export const QueryLocationActions = createActionGroup({
  source: 'Query Location',
  events: {
    'Set Point': props<{point: PointWithSrs; scale: number}>(),
  },
});
