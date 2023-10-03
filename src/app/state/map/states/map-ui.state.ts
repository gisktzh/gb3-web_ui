import {BottomSheetHeight} from 'src/app/shared/enums/bottom-sheet-heights.enum';
import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content.type';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility.type';
import {BottomSheetContent} from '../../../shared/types/bottom-sheet-content.type';

export interface MapUiState {
  mapSideDrawerContent: MapSideDrawerContent;
  isLegendOverlayVisible: boolean;
  isFeatureInfoOverlayVisible: boolean;
  hideUiElements: boolean;
  hideToggleUiElementsButton: boolean;
  hideZoomButtons: boolean;
  toolMenuVisibility: ToolMenuVisibility | undefined;
  bottomSheetHeight: BottomSheetHeight;
  showBasemapSelector: boolean;
  showMapManagementMobile: boolean;
  bottomSheetContent: BottomSheetContent;
}
