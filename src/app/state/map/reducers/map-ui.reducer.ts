import {createFeature, createReducer, on} from '@ngrx/store';
import {MapUiState} from '../states/map-ui.state';
import {MapUiActions} from '../actions/map-ui.actions';
import {BottomSheetHeight} from 'src/app/shared/enums/bottom-sheet-heights.enum';

export const mapUiFeatureKey = 'mapUi';

export const initialState: MapUiState = {
  mapSideDrawerContent: 'none',
  isLegendOverlayVisible: false,
  isFeatureInfoOverlayVisible: false,
  hideUiElements: false,
  hideToggleUiElementsButton: false,
  hideZoomButtons: false,
  toolMenuVisibility: undefined,
  bottomSheetHeight: BottomSheetHeight.medium,
  showBasemapSelector: false,
  showMapManagementMobile: false,
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
        mapSideDrawerContent: state.mapSideDrawerContent,
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
    on(MapUiActions.setBottomSheetHeight, (state, {bottomSheetHeight}): MapUiState => {
      return {
        ...state,
        bottomSheetHeight: bottomSheetHeight,
      };
    }),
    on(MapUiActions.hideUiElements, (state): MapUiState => {
      return {
        ...state,
        //hideUiElements: true, // TODO: Differentiate between mobile and desktop
      };
    }),
    on(MapUiActions.showUiElements, (state): MapUiState => {
      return {
        ...state,
        hideUiElements: false,
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
  ),
});

export const {
  name,
  reducer,
  selectMapUiState,
  selectToolMenuVisibility,
  selectIsLegendOverlayVisible,
  selectIsFeatureInfoOverlayVisible,
  selectBottomSheetHeight,
  selectShowBasemapSelector,
  selectShowMapManagementMobile,
  selectBottomSheetContent,
} = mapUiFeature;
