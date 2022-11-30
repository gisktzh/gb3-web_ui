import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {Legend} from '../../../../shared/services/apis/gb3/gb3-api.interfaces';

export const LegendActions = createActionGroup({
  source: 'Legend',
  events: {
    'Toggle Display': emptyProps(),
    'Add Legend Content': props<{legend: Legend}>(),
    'Clear Legend Content': emptyProps()
  }
});
