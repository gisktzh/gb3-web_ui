import {createFeature, createReducer, on} from '@ngrx/store';
import {MapUiState} from '../states/map-ui.state';
import {MapUiActions} from '../actions/map-ui.actions';

export const mapUiFeatureKey = 'mapUi';

export const initialState: MapUiState = {
  mapSideDrawerContent: 'none',
  hideUiElements: false,
  hideToggleUiElementsButton: false,
  hideZoomButtons: false
};

export const mapUiFeature = createFeature({
  name: mapUiFeatureKey,
  reducer: createReducer(
    initialState,
    on(MapUiActions.changeUiElementsVisibility, (state, {hideAllUiElements, hideUiToggleButton}): MapUiState => {
      return {
        mapSideDrawerContent: state.mapSideDrawerContent,
        hideUiElements: hideAllUiElements,
        hideToggleUiElementsButton: hideUiToggleButton,
        hideZoomButtons: hideAllUiElements
      };
    }),
    on(MapUiActions.showMapSideDrawerContent, (state, {mapSideDrawerContent}): MapUiState => {
      return {
        ...state,
        mapSideDrawerContent: mapSideDrawerContent
      };
    }),
    on(MapUiActions.hideMapSideDrawerContent, (state): MapUiState => {
      return {
        ...state,
        mapSideDrawerContent: 'none'
      };
    })
  )
});

export const {name, reducer, selectMapUiState} = mapUiFeature;
