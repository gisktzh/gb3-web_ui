import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content.type';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility.type';

export interface MapUiState {
  mapSideDrawerContent: MapSideDrawerContent;
  hideUiElements: boolean;
  hideToggleUiElementsButton: boolean;
  hideZoomButtons: boolean;
  toolMenuVisibility: ToolMenuVisibility | undefined;
}
