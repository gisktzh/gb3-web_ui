import {createFeature, createReducer, on} from '@ngrx/store';
import {MapUiState} from '../states/map-ui.state';
import {MapUiActions} from '../actions/map-ui.actions';

export const mapUiFeatureKey = 'mapUi';

export const initialState: MapUiState = {
  mapSideDrawerContent: 'none',
  hideActiveMapItems: false,
  hideMapCatalogue: false,
  hideLegendButton: false,
  hideMapSearch: false,
  hideMapTools: false,
  hideScaleBar: false,
  hideBasemapSelector: false,
  hideCoordinateScaleInputs: false,
  hideToggleUiElementsButton: false,
  hideZoomButtons: false,
  hideLocateMeButton: false,
  hideLegendOverlay: false,
  hideFeatureInfoOverlay: false
};

export const mapUiFeature = createFeature({
  name: mapUiFeatureKey,
  reducer: createReducer(
    initialState,
    on(MapUiActions.toggleAllUiElements, (state, {hideAllElements}): MapUiState => {
      return {
        mapSideDrawerContent: state.mapSideDrawerContent,
        hideActiveMapItems: hideAllElements,
        hideMapCatalogue: hideAllElements,
        hideLegendButton: hideAllElements,
        hideMapSearch: hideAllElements,
        hideMapTools: hideAllElements,
        hideScaleBar: hideAllElements,
        hideBasemapSelector: hideAllElements,
        hideCoordinateScaleInputs: hideAllElements,
        hideToggleUiElementsButton: hideAllElements,
        hideZoomButtons: hideAllElements,
        hideLocateMeButton: hideAllElements,
        hideLegendOverlay: hideAllElements,
        hideFeatureInfoOverlay: hideAllElements
      };
    }),
    on(MapUiActions.toggleAllUiElementsExceptToggleButton, (state, {hideAllElements}): MapUiState => {
      return {
        mapSideDrawerContent: state.mapSideDrawerContent,
        hideActiveMapItems: hideAllElements,
        hideMapCatalogue: hideAllElements,
        hideLegendButton: hideAllElements,
        hideMapSearch: hideAllElements,
        hideMapTools: hideAllElements,
        hideScaleBar: hideAllElements,
        hideBasemapSelector: hideAllElements,
        hideCoordinateScaleInputs: hideAllElements,
        hideToggleUiElementsButton: false,
        hideZoomButtons: hideAllElements,
        hideLocateMeButton: hideAllElements,
        hideLegendOverlay: hideAllElements,
        hideFeatureInfoOverlay: hideAllElements
      };
    }),
    on(MapUiActions.setMapSideDrawerContent, (state, {mapSideDrawerContent}): MapUiState => {
      return {
        ...state,
        mapSideDrawerContent: mapSideDrawerContent
      };
    })
  )
});

export const {name, reducer, selectMapUiState} = mapUiFeature;
