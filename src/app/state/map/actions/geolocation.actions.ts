import {createActionGroup, emptyProps, props} from '@ngrx/store';

export const GeolocationActions = createActionGroup({
  source: 'Geolocation',
  events: {
    'Start Location Request': emptyProps(),
    'Set Success': props<{x: number; y: number}>(),
    'Set Failure': emptyProps()
  }
});
