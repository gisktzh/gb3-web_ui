import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content';
import {Favourite} from '../../../shared/interfaces/favourite.interface';

export const MapUiActions = createActionGroup({
  source: 'MapUi',
  events: {
    'Change Ui Elements Visibility': props<{hideAllUiElements: boolean; hideUiToggleButton: boolean}>(),
    'Show Map Side Drawer Content': props<{mapSideDrawerContent: Exclude<MapSideDrawerContent, 'none'>}>(),
    'Hide Map Side Drawer Content': emptyProps(),
    'Show Legend': emptyProps(),
    'Show Share Link Dialog': emptyProps(),
    'Show Create Favourite Dialog': emptyProps(),
    'Show Delete Favourite Dialog': props<{favouriteToDelete: Favourite}>(),
    'Show Map Notices Dialog': emptyProps()
  }
});
