import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content.type';
import {Favourite} from '../../../shared/interfaces/favourite.interface';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility.type';
import {BottomSheetContent} from 'src/app/shared/types/bottom-sheet-content.type';

export const MapUiActions = createActionGroup({
  source: 'MapUi',
  events: {
    'Change Ui Elements Visibility': props<{hideAllUiElements: boolean; hideUiToggleButton: boolean}>(),
    'Show Map Side Drawer Content': props<{mapSideDrawerContent: Exclude<MapSideDrawerContent, 'none'>}>(),
    'Hide Map Side Drawer Content': emptyProps(),
    'Set Legend Overlay Visibility': props<{isVisible: boolean}>(),
    'Set Feature Info Visibility': props<{isVisible: boolean}>(),
    'Show Share Link Dialog': emptyProps(),
    'Show Create Favourite Dialog': emptyProps(),
    'Show Delete Favourite Dialog': props<{favouriteToDelete: Favourite}>(),
    'Show Map Notices Dialog': emptyProps(),
    'Toggle Tool Menu': props<{tool?: ToolMenuVisibility}>(),
    'Show Bottom Sheet': props<{bottomSheetContent: Exclude<BottomSheetContent, 'none'>}>(),
    'Hide Bottom Sheet': emptyProps(),
    'Reset Map Ui State': emptyProps(),
    'Disable Active Map Item Drag And Drop': emptyProps(),
    'Enable Active Map Item Drag And Drop': emptyProps(),
  },
});
