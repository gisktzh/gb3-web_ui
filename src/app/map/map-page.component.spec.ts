import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectNumberOfQueryLegends} from '../state/map/selectors/query-legends.selector';
import {selectIsFeatureInfoOverlayVisible, selectMapUiState} from '../state/map/reducers/map-ui.reducer';
import {selectScreenMode} from '../state/app/reducers/app-layout.reducer';
import {selectMapConfigState} from '../state/map/reducers/map-config.reducer';
import {selectRotation} from '../state/map/reducers/map-config.reducer';
import {OnboardingGuideService} from '../onboarding-guide/services/onboarding-guide.service';
import {InitialMapExtentService} from './services/initial-map-extent.service';
import {MapPageComponent} from './map-page.component';
import {MapUiActions} from '../state/map/actions/map-ui.actions';
import {MapConfigActions} from '../state/map/actions/map-config.actions';
import {MapUiState} from '../state/map/states/map-ui.state';
import {MapConfigState} from '../state/map/states/map-config.state';
import {Component, input, output} from '@angular/core';
import {OnboardingGuideComponent} from '../onboarding-guide/components/onboarding-guide/onboarding-guide.component';
import {CenterAnchorComponent} from '../onboarding-guide/components/center-anchor/center-anchor.component';
import {MapService} from './interfaces/map.service';
import {DRAWING_SYMBOLS_SERVICE, MAP_SERVICE} from '../app.tokens';
import {DrawingSymbolsService} from '../shared/interfaces/drawing-symbols-service.interface';
import {MapContainerComponent} from './components/map-container/map-container.component';
import {selectItems} from '../state/map/selectors/active-map-items.selector';
import {ActiveMapItemsComponent} from './components/active-map-items/active-map-items.component';
import {MapDataCatalogueComponent} from './components/map-data-catalogue/map-data-catalogue.component';
import {BottomSheetOverlayComponent} from './components/bottom-sheet-overlay/bottom-sheet-overlay.component';
import {selectIncompleteOrderStatusJobs} from '../state/map/selectors/incomplete-order-status-jobs.selector';
import {selectFeatureInfosForDisplay} from '../state/map/selectors/feature-info-result-display.selector';
import {selectFeatureInfoQueryLoadingState} from '../state/map/selectors/feature-info-query-loading-state.selector';
import {selectFeatureInfoPrintState} from '../state/map/reducers/overlay-print.reducer';
import {SearchWindowComponent} from './components/search-window/search-window.component';
import {MapToolsComponent} from './components/map-tools/map-tools.component';
import {MapControlsComponent} from './components/map-controls/map-controls.component';
import {SearchBarComponent} from '../shared/components/search/search-bar/search-bar.component';
import {SearchMode} from '../shared/types/search-mode.type';

describe('MapPageComponent', () => {
  let component: MapPageComponent;
  let fixture: ComponentFixture<MapPageComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const onboardingGuideServiceMock: Partial<OnboardingGuideService> = {
    autoStart: vi.fn(),
  };

  const initialMapExtentServiceMock: Partial<InitialMapExtentService> = {
    calculateInitialExtent: vi.fn(() => ({
      x: 100,
      y: 200,
      scale: 5000,
    })),
  };

  const mapServiceMock: Partial<MapService> = {};
  const drawingSymbolsServcieMock: Partial<DrawingSymbolsService> = {};

  const mapConfigState: MapConfigState = {
    isMapServiceInitialized: false,
    center: {x: 0, y: 0},
    scale: 0,
    rotation: 0,
    srsId: 2056,
    ready: false,
    scaleSettings: {
      minScale: 0,
      maxScale: 0,
      calculatedMinScale: 0,
      calculatedMaxScale: 0,
    },
    isMaxZoomedIn: false,
    isMaxZoomedOut: false,
    activeBasemapId: 'base',
    initialMaps: [],
    predefinedInitialExtent: false,
    initialMapPadding: {top: 0, right: 0, bottom: 0, left: 0},
    initialMapPaddingMobile: {top: 0, right: 0, bottom: 0, left: 0},
    initialBoundingBox: {
      min: {x: 0, y: 0},
      max: {x: 0, y: 0},
    },
    referenceDistanceInMeters: undefined,
  };

  const mapUiState: MapUiState = {
    mapSideDrawerContent: 'none',
    isLegendOverlayVisible: false,
    isFeatureInfoOverlayVisible: false,
    isElevationProfileOverlayVisible: false,
    isAttributeFilterOverlayVisible: false,
    isDrawingEditOverlayVisible: false,
    isMapSideDrawerOpen: false,
    hideUiElements: false,
    hideToggleUiElementsButton: false,
    hideZoomButtons: false,
    toolMenuVisibility: undefined,
    bottomSheetContent: 'search',
  };

  @Component({
    selector: 'onboarding-guide',
    template: '<div></div>',
  })
  class MockOnboardingGuideComponent {}

  @Component({
    selector: 'center-anchor',
    template: '<div></div>',
  })
  class MockCenterAnchorComponent {}

  @Component({
    selector: 'map-container',
    template: '<div></div>',
  })
  class MockMapContainerComponent {}

  @Component({
    selector: 'active-map-items',
    template: '<div></div>',
  })
  class MockActiveMapItemsComponent {}

  @Component({
    selector: 'map-data-catalogue',
    template: '<div></div>',
  })
  class MockMapDataCatalogueComponent {
    public changeIsMinimizedEvent = output();
  }

  @Component({
    selector: 'bottom-sheet-overlay',
    template: '<div></div>',
  })
  class MockBottomSheetOverlayComponent {}

  @Component({
    selector: 'search-window',
    template: '<div></div>',
  })
  class MockSearchWindowComponent {}

  @Component({
    selector: 'search-bar',
    template: '<div></div>',
  })
  class MockSearchBarComponent {
    public readonly mode = input<SearchMode>('normal');
    public readonly placeholderText = input('Suche nach Karten, Kartendaten, Geodaten und Geodiensten');
    public readonly searchConfig = input<string>('');
    public readonly showFilterButton = input(true);
    public readonly hasFocusEvent = input(false);
  }

  @Component({
    selector: 'map-tools',
    template: '<div></div>',
  })
  class MockMapToolsComponent {}

  @Component({
    selector: 'map-controls',
    template: '<div></div>',
  })
  class MockMapControlsComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapPageComponent],
      providers: [
        {provide: OnboardingGuideService, useValue: onboardingGuideServiceMock},
        {provide: InitialMapExtentService, useValue: initialMapExtentServiceMock},
        {provide: MAP_SERVICE, useValue: mapServiceMock},
        {provide: DRAWING_SYMBOLS_SERVICE, useValue: drawingSymbolsServcieMock},
        provideMockStore(),
      ],
    })
      .overrideComponent(MapPageComponent, {
        remove: {
          imports: [
            OnboardingGuideComponent,
            CenterAnchorComponent,
            MapContainerComponent,
            ActiveMapItemsComponent,
            MapDataCatalogueComponent,
            BottomSheetOverlayComponent,
            SearchWindowComponent,
            SearchBarComponent,
            MapToolsComponent,
            MapControlsComponent,
          ],
          providers: [OnboardingGuideService],
        },
        add: {
          imports: [
            MockOnboardingGuideComponent,
            MockCenterAnchorComponent,
            MockMapContainerComponent,
            MockActiveMapItemsComponent,
            MockMapDataCatalogueComponent,
            MockBottomSheetOverlayComponent,
            MockSearchWindowComponent,
            MockSearchBarComponent,
            MockMapToolsComponent,
            MockMapControlsComponent,
          ],
          providers: [
            {
              provide: OnboardingGuideService,
              useValue: onboardingGuideServiceMock,
            },
          ],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectNumberOfQueryLegends, 0);
    store.overrideSelector(selectMapUiState, mapUiState);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectMapConfigState, mapConfigState);
    store.overrideSelector(selectRotation, 0);
    store.overrideSelector(selectItems, []);
    store.overrideSelector(selectIncompleteOrderStatusJobs, []);
    store.overrideSelector(selectIsFeatureInfoOverlayVisible, false);
    store.overrideSelector(selectFeatureInfosForDisplay, []);
    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loaded');
    store.overrideSelector(selectFeatureInfoPrintState, 'loaded');

    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(MapPageComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch initial map config when no predefined extent exists', () => {
    component.ngOnInit();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      MapConfigActions.setInitialMapConfig({
        x: 100,
        y: 200,
        scale: 5000,
        basemapId: 'base',
        initialMaps: [],
      }),
    );
  });

  it('should not dispatch initial map config when predefined extent exists', () => {
    store.overrideSelector(selectMapConfigState, {
      ...mapConfigState,
      predefinedInitialExtent: true,
    });
    store.refreshState();

    storeDispatchSpy.mockClear();

    component.ngOnInit();

    expect(storeDispatchSpy).not.toHaveBeenCalled();
  });

  it('should start onboarding on desktop after view init', () => {
    component.ngAfterViewInit();

    expect(onboardingGuideServiceMock.autoStart).toHaveBeenCalled();
  });

  it('should not start onboarding on mobile after view init', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();

    onboardingGuideServiceMock.autoStart = vi.fn();

    component.ngAfterViewInit();

    expect(onboardingGuideServiceMock.autoStart).not.toHaveBeenCalled();
  });

  it('should show legend', () => {
    component.showLegend();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
  });

  it('should show map management bottom sheet', () => {
    component.showMapManagement();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapUiActions.showBottomSheet({bottomSheetContent: 'map-management'}));
  });

  it('should update map data catalogue minimized state', () => {
    component.setIsMapDataCatalogueMinimized(true);

    expect(component.isMapDataCatalogueMinimized()).toBe(true);
  });

  it('should close side drawer', () => {
    component.closeSideDrawer();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapUiActions.hideMapSideDrawerContent());
  });

  it('should notify when side drawer is fully opened', () => {
    component.mapSideDrawerFullyOpened();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapUiActions.notifyMapSideDrawerAfterOpen());
  });

  it('should close side drawer on escape key', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapUiActions.hideMapSideDrawerContent());
  });

  it('should render regular layout elements', () => {
    expect(compiled.querySelector('legend-overlay')).toBeTruthy();
    expect(compiled.querySelector('map-controls')).toBeTruthy();
    expect(compiled.querySelector('map-data-catalogue')).toBeTruthy();
  });

  it('should render mobile layout elements', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('search-bar')).toBeTruthy();
    expect(compiled.querySelector('bottom-sheet-overlay')).toBeTruthy();
    expect(compiled.querySelector('map-controls')).toBeFalsy();
  });

  it('should render rotation button when rotation is not zero on mobile', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.overrideSelector(selectRotation, 10);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('map-rotation-button')).toBeTruthy();
  });
});
