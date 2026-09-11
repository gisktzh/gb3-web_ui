import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content.type';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility.type';
import {BottomSheetContent} from 'src/app/shared/types/bottom-sheet-content.type';

export interface MapUiState {
  mapSideDrawerContent: MapSideDrawerContent;
  isLegendOverlayVisible: boolean;
  isFeatureInfoOverlayVisible: boolean;
  isElevationProfileOverlayVisible: boolean;
  isAttributeFilterOverlayVisible: boolean;
  isDrawingEditOverlayVisible: boolean;
  isMapSideDrawerOpen: boolean;
  hideUiElements: boolean;
  hideToggleUiElementsButton: boolean;
  hideZoomButtons: boolean;
  toolMenuVisibility: ToolMenuVisibility | undefined;
  bottomSheetContent: BottomSheetContent;
  /** Width of the right hand side bar in pixels; `undefined` means the default width defined in CSS. */
  sideBarWidth: number | undefined;
}
