import {createActionGroup, props} from '@ngrx/store';

export const AppLayoutActions = createActionGroup({
  source: 'AppLayout',
  events: {
    'Set Scrollbar Width': props<{scrollbarWidth: number}>(),
    'Set Screen Mode': props<{screenMode: string}>(),
  },
});
