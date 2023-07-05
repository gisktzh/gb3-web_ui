import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility';

export interface MapUiState {
  mapSideDrawerContent: MapSideDrawerContent;
  hideUiElements: boolean;
  hideToggleUiElementsButton: boolean;
  hideZoomButtons: boolean;
  toolMenuVisibility: ToolMenuVisibility | undefined;
}
