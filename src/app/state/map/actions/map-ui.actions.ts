import {createActionGroup, props} from '@ngrx/store';
import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content';

export const MapUiActions = createActionGroup({
  source: 'MapUi',
  events: {
    'Toggle All Ui Elements': props<{hideAllElements: boolean}>(),
    'Toggle All Ui Elements Except Toggle Button': props<{hideAllElements: boolean}>(),
    'Set Map Side Drawer Content': props<{mapSideDrawerContent: MapSideDrawerContent}>()
  }
});
