import {createActionGroup, props} from '@ngrx/store';

export const InfoQueryActions = createActionGroup({
  source: 'InfoQuery',
  events: {
    'Send Request': props<{location: __esri.Point}>()
  }
});
