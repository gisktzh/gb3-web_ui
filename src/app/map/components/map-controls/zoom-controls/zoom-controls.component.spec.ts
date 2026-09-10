import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectScreenHeight} from 'src/app/state/app/reducers/app-layout.reducer';
import {selectGeolocationState} from '../../../../state/map/reducers/geolocation.reducer';
import {selectIsMaxZoomedIn, selectIsMaxZoomedOut} from '../../../../state/map/reducers/map-config.reducer';
import {selectMapUiState} from '../../../../state/map/reducers/map-ui.reducer';
import {GeolocationActions} from '../../../../state/map/actions/geolocation.actions';
import {MapConfigActions} from '../../../../state/map/actions/map-config.actions';
import {LoadingAndProcessBarComponent} from '../../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {ZoomControlsComponent} from './zoom-controls.component';

describe('ZoomControlsComponent', () => {
  let component: ZoomControlsComponent;
  let fixture: ComponentFixture<ZoomControlsComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const showLocateMeButton = signal(false);

  beforeEach(async () => {
    showLocateMeButton.set(false);

    await TestBed.configureTestingModule({
      imports: [ZoomControlsComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsMaxZoomedIn, false);
    store.overrideSelector(selectIsMaxZoomedOut, false);
    store.overrideSelector(selectGeolocationState, {
      loadingState: 'loading',
      errorReason: undefined,
      currentGpsLocation: undefined,
    });
    store.overrideSelector(selectMapUiState, {
      hideUiElements: false,
      hideZoomButtons: false,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.overrideSelector(selectScreenHeight, 'regular');
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(ZoomControlsComponent, {
      bindings: [inputBinding('showLocateMeButton', showLocateMeButton)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render the locate-me button when showLocateMeButton is false', () => {
    expect(compiled.querySelector('[data-test-id="map-locate-me"]')).toBeNull();
    expect(compiled.querySelector('.zoom-controls__divider')).toBeNull();
  });

  it('should render the locate-me button when showLocateMeButton is true', () => {
    showLocateMeButton.set(true);
    fixture.detectChanges();

    expect(compiled.querySelector('[data-test-id="map-locate-me"]')).toBeTruthy();
    expect(compiled.querySelector('.zoom-controls__divider')).toBeTruthy();
  });

  it('should render the home and zoom buttons', () => {
    expect(compiled.querySelector('[data-test-id="map-home"]')).toBeTruthy();
    expect(compiled.querySelector('[data-test-id="map-add"]')).toBeTruthy();
    expect(compiled.querySelector('[data-test-id="map-remove"]')).toBeTruthy();
  });

  it('should hide the home and zoom buttons when zoom buttons are hidden', () => {
    store.overrideSelector(selectMapUiState, {
      hideUiElements: false,
      hideZoomButtons: true,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();
    fixture.detectChanges();

    const controls = compiled.querySelector('[data-test-id="map-home"]')?.parentElement;

    expect(controls?.classList.contains('zoom-controls--hidden')).toBe(true);
  });

  it('should hide the home and zoom buttons when UI elements are hidden', () => {
    store.overrideSelector(selectMapUiState, {
      hideUiElements: true,
      hideZoomButtons: true,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();
    fixture.detectChanges();

    const controls = compiled.querySelector('[data-test-id="map-home"]')?.parentElement;

    expect(controls?.classList.contains('zoom-controls--hidden')).toBe(true);
  });

  it('should hide the home and zoom buttons on a small screen', () => {
    store.overrideSelector(selectScreenHeight, 'small');
    store.refreshState();
    fixture.detectChanges();

    const controls = compiled.querySelector('[data-test-id="map-home"]')?.parentElement;

    expect(controls?.classList.contains('zoom-controls--hidden')).toBe(true);
  });

  it('should hide the locate-me button when UI elements are hidden', () => {
    showLocateMeButton.set(true);
    store.overrideSelector(selectMapUiState, {
      hideUiElements: true,
      hideZoomButtons: false,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();
    fixture.detectChanges();

    const button = compiled.querySelector('[data-test-id="map-locate-me"]');

    expect(button?.classList.contains('zoom-controls--hidden')).toBe(true);
  });

  it('should hide the divider when UI elements are hidden', () => {
    showLocateMeButton.set(true);
    store.overrideSelector(selectMapUiState, {
      hideUiElements: true,
      hideZoomButtons: false,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();
    fixture.detectChanges();

    const divider = compiled.querySelector('.zoom-controls__divider');

    expect(divider?.classList.contains('zoom-controls--hidden')).toBe(true);
  });

  it('should hide the divider when zoom buttons are hidden', () => {
    showLocateMeButton.set(true);
    store.overrideSelector(selectMapUiState, {
      hideUiElements: false,
      hideZoomButtons: true,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();
    fixture.detectChanges();

    const divider = compiled.querySelector('.zoom-controls__divider');

    expect(divider?.classList.contains('zoom-controls--hidden')).toBe(true);
  });

  it('should hide the divider on a small screen', () => {
    showLocateMeButton.set(true);
    store.overrideSelector(selectScreenHeight, 'small');
    store.refreshState();
    fixture.detectChanges();

    const divider = compiled.querySelector('.zoom-controls__divider');

    expect(divider?.classList.contains('zoom-controls--hidden')).toBe(true);
  });

  it('should disable the locate-me button while geolocation is loading', () => {
    showLocateMeButton.set(true);
    store.overrideSelector(selectGeolocationState, {
      loadingState: 'loading',
      errorReason: undefined,
      currentGpsLocation: undefined,
    });
    store.refreshState();
    fixture.detectChanges();

    const button = compiled.querySelector('[data-test-id="map-locate-me"]') as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it('should enable the locate-me button when geolocation is not loading', () => {
    showLocateMeButton.set(true);
    store.overrideSelector(selectGeolocationState, {
      loadingState: 'loaded',
      errorReason: undefined,
      currentGpsLocation: undefined,
    });
    store.refreshState();
    fixture.detectChanges();

    const button = compiled.querySelector('[data-test-id="map-locate-me"]') as HTMLButtonElement;

    expect(button.disabled).toBe(false);
  });

  it('should use the default locate-me tooltip when there is no geolocation error', () => {
    showLocateMeButton.set(true);
    fixture.detectChanges();

    const button = compiled.querySelector('[data-test-id="map-locate-me"]');

    expect(button?.getAttribute('aria-label')).toBe('Deinen Standort anzeigen');
  });

  it('should use the geolocation error as the locate-me tooltip', () => {
    showLocateMeButton.set(true);
    store.overrideSelector(selectGeolocationState, {
      loadingState: 'error',
      errorReason: 'Standort konnte nicht ermittelt werden',
      currentGpsLocation: undefined,
    });
    store.refreshState();
    fixture.detectChanges();

    const button = compiled.querySelector('[data-test-id="map-locate-me"]');

    expect(button?.getAttribute('aria-label')).toBe('Standort konnte nicht ermittelt werden');
  });

  it('should use the default error text when no geolocation error reason is available', () => {
    showLocateMeButton.set(true);
    store.overrideSelector(selectGeolocationState, {
      loadingState: 'error',
      errorReason: undefined,
      currentGpsLocation: undefined,
    });
    store.refreshState();
    fixture.detectChanges();

    const button = compiled.querySelector('[data-test-id="map-locate-me"]');

    expect(button?.getAttribute('aria-label')).toBe('Ein Fehler ist aufgetreten');
  });

  it('should pass the geolocation loading state to the loading bar', () => {
    showLocateMeButton.set(true);
    store.overrideSelector(selectGeolocationState, {
      loadingState: 'loading',
      errorReason: undefined,
      currentGpsLocation: undefined,
    });
    store.refreshState();
    fixture.detectChanges();

    const loadingBar = fixture.debugElement.query(By.directive(LoadingAndProcessBarComponent))
      .componentInstance as LoadingAndProcessBarComponent;

    expect(loadingBar.loadingState()).toBe('loading');
  });

  it('should disable the zoom-in button when maximum zoom is reached', () => {
    store.overrideSelector(selectIsMaxZoomedIn, true);
    store.refreshState();
    fixture.detectChanges();

    const button = compiled.querySelector('[data-test-id="map-add"]') as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it('should disable the zoom-out button when minimum zoom is reached', () => {
    store.overrideSelector(selectIsMaxZoomedOut, true);
    store.refreshState();
    fixture.detectChanges();

    const button = compiled.querySelector('[data-test-id="map-remove"]') as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it('should dispatch resetExtent when the home button is clicked', () => {
    const button = compiled.querySelector('[data-test-id="map-home"]') as HTMLButtonElement;

    button.click();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapConfigActions.resetExtent());
  });

  it('should dispatch zoomIn when the zoom-in button is clicked', () => {
    const button = compiled.querySelector('[data-test-id="map-add"]') as HTMLButtonElement;

    button.click();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapConfigActions.changeZoom({zoomType: 'zoomIn'}));
  });

  it('should dispatch zoomOut when the zoom-out button is clicked', () => {
    const button = compiled.querySelector('[data-test-id="map-remove"]') as HTMLButtonElement;

    button.click();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapConfigActions.changeZoom({zoomType: 'zoomOut'}));
  });

  it('should dispatch resetExtent through goToInitialExtent', () => {
    component.goToInitialExtent();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapConfigActions.resetExtent());
  });

  it('should dispatch zoomIn through handleZoom', () => {
    component.handleZoom('zoomIn');

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapConfigActions.changeZoom({zoomType: 'zoomIn'}));
  });

  it('should dispatch zoomOut through handleZoom', () => {
    component.handleZoom('zoomOut');

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapConfigActions.changeZoom({zoomType: 'zoomOut'}));
  });

  it('should dispatch a location request through locateClient', () => {
    component.locateClient();

    expect(storeDispatchSpy).toHaveBeenCalledWith(GeolocationActions.startLocationRequest());
  });
});
