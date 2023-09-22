import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content.type';
import {Favourite} from '../../../shared/interfaces/favourite.interface';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility.type';

export const MapUiActions = createActionGroup({
  source: 'MapUi',
  events: {
    'Change Ui Elements Visibility': props<{hideAllUiElements: boolean; hideUiToggleButton: boolean}>(),
    'Show Map Side Drawer Content': props<{mapSideDrawerContent: Exclude<MapSideDrawerContent, 'none'>}>(),
    'Hide Map Side Drawer Content': emptyProps(),
    'Show Legend': emptyProps(),
    'Hide Legend': emptyProps(),
    'Show Share Link Dialog': emptyProps(),
    'Show Create Favourite Dialog': emptyProps(),
    'Show Delete Favourite Dialog': props<{favouriteToDelete: Favourite}>(),
    'Show Map Notices Dialog': emptyProps(),
    'Toggle Tool Menu': props<{tool?: ToolMenuVisibility}>(),
    'Show Bottom Sheet Overlay': emptyProps(),
  },
});
