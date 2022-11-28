import {createActionGroup, emptyProps} from '@ngrx/store';

export const LegendActions = createActionGroup({
  source: 'Legend',
  events: {
    'Toggle Display': emptyProps()
  }
});
