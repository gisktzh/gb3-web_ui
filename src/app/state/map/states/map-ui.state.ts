import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content.type';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility.type';
import {BottomSheetContent} from 'src/app/shared/types/bottom-sheet-content.type';

export interface MapUiState {
  mapSideDrawerContent: MapSideDrawerContent;
  isLegendOverlayVisible: boolean;
  isFeatureInfoOverlayVisible: boolean;
  isElevationProfileOverlayVisible: boolean;
  isAttributeFilterOverlayVisible: boolean;
  isMapSideDrawerOpen: boolean;
  hideUiElements: boolean;
  hideToggleUiElementsButton: boolean;
  hideZoomButtons: boolean;
  toolMenuVisibility: ToolMenuVisibility | undefined;
  bottomSheetContent: BottomSheetContent;
}
