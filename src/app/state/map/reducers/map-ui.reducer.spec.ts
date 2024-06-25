import {initialState, reducer} from './map-ui.reducer';
import {MapUiActions} from '../actions/map-ui.actions';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility.type';
import {MapUiState} from '../states/map-ui.state';
import {MapSideDrawerContent} from '../../../shared/types/map-side-drawer-content.type';
import {BottomSheetContent} from '../../../shared/types/bottom-sheet-content.type';

describe('MapUi Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('toggleToolMenu', () => {
    it('adjust toolMenuVisibility only', () => {
      const expectedTool: ToolMenuVisibility = 'measurement';
      const action = MapUiActions.toggleToolMenu({tool: expectedTool});

      const result = reducer(initialState, action);

      expect(result).toEqual({...initialState, toolMenuVisibility: expectedTool});
    });
  });

  describe('setElevationProfileOverlayVisibility', () => {
    it('adjust isElevationProfileOverlayVisible only', () => {
      const expectedSetting = !initialState.isElevationProfileOverlayVisible;
      const action = MapUiActions.setElevationProfileOverlayVisibility({isVisible: expectedSetting});

      const result = reducer(initialState, action);

      expect(result).toEqual({...initialState, isElevationProfileOverlayVisible: expectedSetting});
    });
  });

  describe('setLegendOverlayVisibility', () => {
    it('adjust isLegendOverlayVisible and bottomSheetContent only', () => {
      const expectedSetting = true;
      const action = MapUiActions.setLegendOverlayVisibility({isVisible: expectedSetting});

      const result = reducer(initialState, action);

      expect(result).toEqual({...initialState, isLegendOverlayVisible: expectedSetting, bottomSheetContent: 'legend'});
    });

    it('sets bottomSheetContent to none if !isVisible', () => {
      const expectedSetting = false;
      const mockState: MapUiState = {
        ...initialState,
        hideZoomButtons: true,
        isLegendOverlayVisible: true,
        bottomSheetContent: 'legend',
      };
      const action = MapUiActions.setLegendOverlayVisibility({isVisible: expectedSetting});

      const result = reducer(mockState, action);

      expect(result).toEqual({...mockState, isLegendOverlayVisible: expectedSetting, bottomSheetContent: 'none'});
    });
  });

  describe('setFeatureInfoVisibility', () => {
    it('adjust isFeatureInfoOverlayVisible and bottomSheetContent only', () => {
      const expectedSetting = true;
      const action = MapUiActions.setFeatureInfoVisibility({isVisible: expectedSetting});

      const result = reducer(initialState, action);

      expect(result).toEqual({...initialState, isFeatureInfoOverlayVisible: expectedSetting, bottomSheetContent: 'feature-info'});
    });

    it('sets bottomSheetContent to none if !isVisible', () => {
      const expectedSetting = false;
      const mockState: MapUiState = {
        ...initialState,
        hideZoomButtons: true,
        isFeatureInfoOverlayVisible: true,
        bottomSheetContent: 'legend',
      };
      const action = MapUiActions.setFeatureInfoVisibility({isVisible: expectedSetting});

      const result = reducer(mockState, action);

      expect(result).toEqual({...mockState, isFeatureInfoOverlayVisible: expectedSetting, bottomSheetContent: 'none'});
    });
  });

  describe('setAttributeFilterVisibility', () => {
    it('adjust isAttributeFilterOverlayVisible and bottomSheetContent only', () => {
      const expectedSetting = true;
      const action = MapUiActions.setAttributeFilterVisibility({isVisible: expectedSetting});

      const result = reducer(initialState, action);

      expect(result).toEqual({...initialState, isAttributeFilterOverlayVisible: expectedSetting, bottomSheetContent: 'map-attributes'});
    });

    it('sets bottomSheetContent to none if !isVisible', () => {
      const expectedSetting = false;
      const mockState: MapUiState = {
        ...initialState,
        hideZoomButtons: true,
        isFeatureInfoOverlayVisible: true,
        bottomSheetContent: 'legend',
      };
      const action = MapUiActions.setAttributeFilterVisibility({isVisible: expectedSetting});

      const result = reducer(mockState, action);

      expect(result).toEqual({...mockState, isAttributeFilterOverlayVisible: expectedSetting, bottomSheetContent: 'none'});
    });
  });

  describe('changeUiElementsVisibility', () => {
    it('adjust hideUiElements, hideToggleUiElementsButton and hideZoomButtons only', () => {
      const expectedSetting = true;
      const action = MapUiActions.changeUiElementsVisibility({
        hideAllUiElements: expectedSetting,
        hideUiToggleButton: expectedSetting,
      });

      const result = reducer(initialState, action);

      expect(result).toEqual({...initialState, hideUiElements: expectedSetting, hideToggleUiElementsButton: true, hideZoomButtons: true});
    });
  });

  describe('showMapSideDrawerContent', () => {
    it('adjust mapSideDrawerContent only', () => {
      const expectedSetting: MapSideDrawerContent = 'data-download';
      const action = MapUiActions.showMapSideDrawerContent({mapSideDrawerContent: expectedSetting});

      const result = reducer(initialState, action);

      expect(result).toEqual({...initialState, mapSideDrawerContent: expectedSetting});
    });
  });

  describe('hideMapSideDrawerContent', () => {
    it('adjust mapSideDrawerContent only', () => {
      const mockState: MapUiState = {
        ...initialState,
        hideZoomButtons: true,
        mapSideDrawerContent: 'print',
        isMapSideDrawerOpen: false,
      };
      const action = MapUiActions.hideMapSideDrawerContent();

      const result = reducer(mockState, action);

      expect(result).toEqual({...mockState, mapSideDrawerContent: 'none'});
    });
  });

  describe('showBottomSheet', () => {
    it('adjust bottomSheetContent and hideUiElements only', () => {
      const expectedSetting: BottomSheetContent = 'map-management';
      const action = MapUiActions.showBottomSheet({bottomSheetContent: expectedSetting});

      const result = reducer(initialState, action);

      expect(result).toEqual({...initialState, hideUiElements: true, bottomSheetContent: expectedSetting});
    });
  });

  describe('hideBottomSheet', () => {
    it('resets bottomSheetContent and hdieUiElements only', () => {
      const mockState: MapUiState = {
        ...initialState,
        hideZoomButtons: true,
        hideUiElements: true,
        mapSideDrawerContent: 'print',
      };
      const action = MapUiActions.hideBottomSheet();

      const result = reducer(mockState, action);

      expect(result).toEqual({...mockState, hideUiElements: false, bottomSheetContent: 'none'});
    });
  });

  describe('notifyMapSideDrawerAfterOpen', () => {
    it('set isMapSideDrawer to true', () => {
      const action = MapUiActions.notifyMapSideDrawerAfterOpen();

      const result = reducer(initialState, action);

      expect(result).toEqual({...initialState, isMapSideDrawerOpen: true});
    });
  });
  describe('resetMapUiState', () => {
    it('resets state to initialState', () => {
      const mockState: MapUiState = {
        ...initialState,
        isElevationProfileOverlayVisible: true,
        toolMenuVisibility: 'drawing',
        bottomSheetContent: 'legend',
      };
      const action = MapUiActions.resetMapUiState();

      const result = reducer(mockState, action);

      expect(result).toEqual(initialState);
    });
  });
});
