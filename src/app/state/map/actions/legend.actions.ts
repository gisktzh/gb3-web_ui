import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {LegendResponse} from '../../../shared/interfaces/legend.interface';

export const LegendActions = createActionGroup({
  source: 'Legend',
  events: {
    'Load Legend': emptyProps(),
    'Add Legend Content': props<{legends: LegendResponse[]}>(),
    'Hide Legend': emptyProps()
  }
});
