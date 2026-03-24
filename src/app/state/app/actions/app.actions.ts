import {createActionGroup, props} from '@ngrx/store';

import {DynamicInternalUrlsConfiguration} from '../../../shared/types/dynamic-internal-url.type';
import {AccessMode} from '../../../shared/types/access-mode.type';

export const AppActions = createActionGroup({
  source: 'App',
  events: {
    'Set Dynamic Internal Url Configuration': props<{dynamicInternalUrlsConfiguration: DynamicInternalUrlsConfiguration}>(),
    'Set Access Mode': props<{accessMode: AccessMode}>(),
  },
});
