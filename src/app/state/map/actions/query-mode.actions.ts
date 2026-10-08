import {createActionGroup, props} from '@ngrx/store';

import {QueryMode} from '../../../shared/types/query-mode.type';

export const QueryModeActions = createActionGroup({
  source: 'QueryMode',
  events: {
    'Select Query Mode': props<{queryMode: QueryMode}>(),
    'Set Query Mode': props<{queryMode: QueryMode}>(),
  },
});
