import {createActionGroup, props} from '@ngrx/store';
import {ScreenHeight} from 'src/app/shared/types/screen-height-type';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';

export const AppLayoutActions = createActionGroup({
  source: 'AppLayout',
  events: {
    'Set Scrollbar Width': props<{scrollbarWidth: number}>(),
    'Set Screen Mode': props<{screenMode: ScreenMode; screenHeight: ScreenHeight}>(),
  },
});
