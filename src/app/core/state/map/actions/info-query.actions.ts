import {createActionGroup, emptyProps, props} from '@ngrx/store';

export const InfoQueryActions = createActionGroup({
  source: 'InfoQuery',
  events: {
    'Send Request': props<{x: number; y: number}>(),
    'Clear Info Query Content': emptyProps()
  }
});
