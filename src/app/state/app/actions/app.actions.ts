import {createActionGroup, emptyProps, props} from '@ngrx/store';

import {DynamicInternalUrlsConfiguration} from '../../../shared/types/dynamic-internal-url.type';

export const AppActions = createActionGroup({
  source: 'App',
  events: {
    'Activate Dev Mode': emptyProps(),
    'Set Dynamic Internal Url Configuration': props<{dynamicInternalUrlsConfiguration: DynamicInternalUrlsConfiguration}>(),
  },
});
