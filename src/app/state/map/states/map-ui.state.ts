import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content';

export interface MapUiState {
  mapSideDrawerContent: MapSideDrawerContent;
  hideUiElements: boolean;
  hideToggleUiElementsButton: boolean;
  hideZoomButtons: boolean;
}
