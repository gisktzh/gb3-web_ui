import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content';

export interface MapUiState {
  mapSideDrawerContent: MapSideDrawerContent;
  hideActiveMapItems: boolean;
  hideMapCatalogue: boolean;
  hideLegendButton: boolean;
  hideMapSearch: boolean;
  hideMapTools: boolean;
  hideScaleBar: boolean;
  hideBasemapSelector: boolean;
  hideCoordinateScaleInputs: boolean;
  hideToggleUiElementsButton: boolean;
  hideZoomButtons: boolean;
  hideLocateMeButton: boolean;
  hideLegendOverlay: boolean;
  hideFeatureInfoOverlay: boolean;
}
