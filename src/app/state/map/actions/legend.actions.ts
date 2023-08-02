import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {LegendResponse} from '../../../shared/interfaces/legend.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';

export const LegendActions = createActionGroup({
  source: 'Legend',
  events: {
    'Load Legend': emptyProps(),
    'Add Legend Content': props<{legends: LegendResponse[]}>(),
    'Hide Legend': emptyProps(),
    'Set Error': errorProps(),
  },
});
