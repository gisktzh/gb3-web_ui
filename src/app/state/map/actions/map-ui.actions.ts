import {createActionGroup, props} from '@ngrx/store';

export const MapUiActions = createActionGroup({
  source: 'MapUi',
  events: {
    'Toggle All Ui Elements': props<{hideAllElements: boolean}>(),
    'Toggle All Ui Elements Except Toggle Button': props<{hideAllElements: boolean}>()
  }
});
