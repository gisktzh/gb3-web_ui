import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';

export const GeolocationActions = createActionGroup({
  source: 'Geolocation',
  events: {
    'Start Location Request': emptyProps(),
    'Set Geolocation': props<{location: PointWithSrs}>(),
    'Set Failure': props<{error: GeolocationPositionError}>(),
  },
});
