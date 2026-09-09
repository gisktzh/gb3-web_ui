import {createActionGroup, props} from '@ngrx/store';

import {QueryMode} from '../../../shared/types/query-mode.type';

export const QueryModeActions = createActionGroup({
  source: 'QueryMode',
  events: {
    'Set Query Mode': props<{queryMode: QueryMode}>(),
  },
});
