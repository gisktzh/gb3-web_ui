import {createFeature, createReducer, on} from '@ngrx/store';
import {MapUiActions} from '../actions/map-ui.actions';
import {MapUiState} from '../states/map-ui.state';

export const mapUiFeatureKey = 'mapUi';

export const initialState: MapUiState = {
  mapSideDrawerContent: 'none',
  isLegendOverlayVisible: false,
  isFeatureInfoOverlayVisible: false,
  isElevationProfileOverlayVisible: false,
  hideUiElements: false,
  hideToggleUiElementsButton: false,
  hideZoomButtons: false,
  toolMenuVisibility: undefined,
  bottomSheetContent: 'none',
};

export const mapUiFeature = createFeature({
  name: mapUiFeatureKey,
  reducer: createReducer(
    initialState,
    on(MapUiActions.toggleToolMenu, (state, {tool}): MapUiState => {
      return {
        ...state,
        toolMenuVisibility: tool,
      };
    }),
    on(MapUiActions.setElevationProfileOverlayVisibility, (state, {isVisible}): MapUiState => {
      return {
        ...state,
        isElevationProfileOverlayVisible: isVisible,
      };
    }),
    on(MapUiActions.setLegendOverlayVisibility, (state, {isVisible}): MapUiState => {
      return {
        ...state,
        isLegendOverlayVisible: isVisible,
        bottomSheetContent: isVisible ? 'legend' : 'none',
      };
    }),
    on(MapUiActions.setFeatureInfoVisibility, (state, {isVisible}): MapUiState => {
      return {
        ...state,
        isFeatureInfoOverlayVisible: isVisible,
        bottomSheetContent: isVisible ? 'feature-info' : 'none',
      };
    }),
    on(MapUiActions.changeUiElementsVisibility, (state, {hideAllUiElements, hideUiToggleButton}): MapUiState => {
      return {
        ...state, // todo: what needs to be done here for toolmenu?
        hideUiElements: hideAllUiElements,
        hideToggleUiElementsButton: hideUiToggleButton,
        hideZoomButtons: hideAllUiElements,
      };
    }),
    on(MapUiActions.showMapSideDrawerContent, (state, {mapSideDrawerContent}): MapUiState => {
      return {
        ...state,
        mapSideDrawerContent: mapSideDrawerContent,
      };
    }),
    on(MapUiActions.hideMapSideDrawerContent, (state): MapUiState => {
      return {
        ...state,
        mapSideDrawerContent: 'none',
      };
    }),
    on(MapUiActions.showBottomSheet, (state, {bottomSheetContent}): MapUiState => {
      return {
        ...state,
        bottomSheetContent: bottomSheetContent,
        hideUiElements: true,
      };
    }),
    on(MapUiActions.hideBottomSheet, (state): MapUiState => {
      return {
        ...state,
        bottomSheetContent: 'none',
        hideUiElements: false,
      };
    }),
    on(MapUiActions.resetMapUiState, (): MapUiState => {
      return {...initialState};
    }),
  ),
});

export const {
  name,
  reducer,
  selectMapUiState,
  selectToolMenuVisibility,
  selectIsElevationProfileOverlayVisible,
  selectIsLegendOverlayVisible,
  selectIsFeatureInfoOverlayVisible,
  selectBottomSheetContent,
  selectHideUiElements,
  selectHideToggleUiElementsButton,
} = mapUiFeature;
