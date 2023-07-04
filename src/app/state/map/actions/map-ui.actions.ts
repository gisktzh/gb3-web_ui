import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content';

export const MapUiActions = createActionGroup({
  source: 'MapUi',
  events: {
    'Change Ui Elements Visibility': props<{hideAllUiElements: boolean; hideUiToggleButton: boolean}>(),
    'Show Map Side Drawer Content': props<{mapSideDrawerContent: Exclude<MapSideDrawerContent, 'none'>}>(),
    'Hide Map Side Drawer Content': emptyProps(),
    'Show Legend': emptyProps(),
    'Show Feature Info': emptyProps()
  }
});
