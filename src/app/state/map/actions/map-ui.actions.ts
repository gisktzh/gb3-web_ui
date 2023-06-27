import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content';

export const MapUiActions = createActionGroup({
  source: 'MapUi',
  events: {
    'Change Ui Elements Visibility': props<{hideAllUiElements: boolean; hideUiToggleButton: boolean}>(),
    'Set Map Side Drawer Content': props<{mapSideDrawerContent: MapSideDrawerContent}>(),
    'Show Legend': emptyProps(),
    'Show Feature Info': emptyProps()
  }
});
