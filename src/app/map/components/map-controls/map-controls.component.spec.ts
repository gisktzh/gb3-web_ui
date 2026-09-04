import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {selectMapUiState} from '../../../state/map/reducers/map-ui.reducer';
import {BasemapSelectorComponent} from './basemap-selector/basemap-selector.component';
import {CoordinateScaleInputsComponent} from './coordinate-scale-inputs/coordinate-scale-inputs.component';
import {MapControlsComponent} from './map-controls.component';
import {ScaleBarComponent} from './scale-bar/scale-bar.component';
import {UiToggleComponent} from './ui-toggle/ui-toggle.component';
import {ZoomControlsComponent} from './zoom-controls/zoom-controls.component';
import {provideUiTour} from 'ngx-ui-tour-md-menu';
import {selectCenter} from 'src/app/state/map/reducers/map-config.reducer';
import {selectGeolocationState} from 'src/app/state/map/reducers/geolocation.reducer';

describe('MapControlsComponent', () => {
  let component: MapControlsComponent;
  let fixture: ComponentFixture<MapControlsComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapControlsComponent],
      providers: [provideMockStore(), provideUiTour()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectCenter, {x: 10, y: 10});
    store.overrideSelector(selectGeolocationState, {
      errorReason: undefined,
      currentGpsLocation: undefined,
      loadingState: 'loaded',
    });
    store.overrideSelector(selectMapUiState, {
      hideUiElements: false,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      hideZoomButtons: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();

    fixture = TestBed.createComponent(MapControlsComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the basemap selector', () => {
    const basemapSelector = fixture.debugElement.query(By.directive(BasemapSelectorComponent));

    expect(basemapSelector).toBeTruthy();
    expect(basemapSelector.nativeElement.classList.contains('map-controls__inputs__basemap-selector')).toBe(true);
  });

  it('should render the scale bar', () => {
    const scaleBar = fixture.debugElement.query(By.directive(ScaleBarComponent));

    expect(scaleBar).toBeTruthy();
  });

  it('should render the coordinate scale inputs', () => {
    const coordinateScaleInputs = fixture.debugElement.query(By.directive(CoordinateScaleInputsComponent));

    expect(coordinateScaleInputs).toBeTruthy();
    expect(coordinateScaleInputs.nativeElement.classList.contains('map-controls__inputs__bottom__data-inputs')).toBe(true);
  });

  it('should render the zoom controls', () => {
    const zoomControls = fixture.debugElement.query(By.directive(ZoomControlsComponent));
    const zoomControlsComponent = zoomControls.componentInstance as ZoomControlsComponent;

    expect(zoomControls).toBeTruthy();
    expect(zoomControlsComponent.showLocateMeButton()).toBe(true);
    expect(zoomControls.nativeElement.classList.contains('map-controls__buttons__group')).toBe(true);
  });

  it('should render the UI toggle in regular screen mode', () => {
    const uiToggle = fixture.debugElement.query(By.directive(UiToggleComponent));

    expect(uiToggle).toBeTruthy();
    expect(uiToggle.nativeElement.classList.contains('map-controls__buttons__group')).toBe(true);
  });

  it('should not render the UI toggle in mobile screen mode', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(UiToggleComponent))).toBeNull();
  });

  it('should render the UI toggle again when switching back to regular screen mode', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(UiToggleComponent))).toBeTruthy();
  });

  it('should not hide map UI elements when hideUiElements is false', () => {
    const hiddenElements = compiled.querySelectorAll('.map-controls__map-element--hidden');

    expect(hiddenElements.length).toBe(0);
  });

  it('should hide the basemap selector when hideUiElements is true', () => {
    store.overrideSelector(selectMapUiState, {
      hideUiElements: true,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      hideZoomButtons: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();
    fixture.detectChanges();

    const basemapSelector = fixture.debugElement.query(By.directive(BasemapSelectorComponent));

    expect(basemapSelector.nativeElement.classList.contains('map-controls__map-element--hidden')).toBe(true);
  });

  it('should hide the scale bar when hideUiElements is true', () => {
    store.overrideSelector(selectMapUiState, {
      hideUiElements: true,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      hideZoomButtons: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();
    fixture.detectChanges();

    const scaleBar = fixture.debugElement.query(By.directive(ScaleBarComponent));

    expect(scaleBar.nativeElement.classList.contains('map-controls__map-element--hidden')).toBe(true);
  });

  it('should hide the coordinate scale inputs when hideUiElements is true', () => {
    store.overrideSelector(selectMapUiState, {
      hideUiElements: true,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      hideZoomButtons: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();
    fixture.detectChanges();

    const coordinateScaleInputs = fixture.debugElement.query(By.directive(CoordinateScaleInputsComponent));

    expect(coordinateScaleInputs.nativeElement.classList.contains('map-controls__map-element--hidden')).toBe(true);
  });

  it('should not hide the zoom controls when hideUiElements is true', () => {
    store.overrideSelector(selectMapUiState, {
      hideUiElements: true,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      hideZoomButtons: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();
    fixture.detectChanges();

    const zoomControls = fixture.debugElement.query(By.directive(ZoomControlsComponent));

    expect(zoomControls.nativeElement.classList.contains('map-controls__map-element--hidden')).toBe(false);
  });

  it('should keep map UI elements visible when hideUiElements changes back to false', () => {
    store.overrideSelector(selectMapUiState, {
      hideUiElements: true,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      hideZoomButtons: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();
    fixture.detectChanges();

    store.overrideSelector(selectMapUiState, {
      hideUiElements: false,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      hideZoomButtons: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.map-controls__map-element--hidden').length).toBe(0);
  });
});
