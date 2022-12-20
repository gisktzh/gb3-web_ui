import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {LegendResponse} from '../../../../shared/models/gb3-api.interfaces';

export const LegendActions = createActionGroup({
  source: 'Legend',
  events: {
    'Show Legend': emptyProps(),
    'Add Legend Content': props<{legends: LegendResponse[]}>(),
    'Hide Legend': emptyProps()
  }
});
