import {Component, input} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectNumberOfQueryLegends} from '../state/map/selectors/query-legends.selector';
import {selectApplicationInitializationLoadingState} from '../state/map/reducers/share-link.reducer';
import {MapUiActions} from '../state/map/actions/map-ui.actions';
import {ShareLinkActions} from '../state/map/actions/share-link.actions';
import {RouteParamConstants} from '../shared/constants/route-param.constants';
import {ShareLinkParameterInvalid} from '../shared/errors/share-link.errors';
import {EmbeddedMapPageComponent} from './embedded-map-page.component';
import {MapContainerComponent} from '../map/components/map-container/map-container.component';
import {LegendOverlayComponent} from '../map/components/legend-overlay/legend-overlay.component';
import {FeatureInfoOverlayComponent} from '../map/components/feature-info-overlay/feature-info-overlay.component';
import {ZoomControlsComponent} from '../map/components/map-controls/zoom-controls/zoom-controls.component';

@Component({
  selector: 'map-container',
  standalone: true,
  template: '',
})
class MockMapContainerComponent {}

@Component({
  selector: 'legend-overlay',
  standalone: true,
  template: '',
})
class MockLegendOverlayComponent {
  public readonly showInteractiveElements = input(true);
}

@Component({
  selector: 'feature-info-overlay',
  standalone: true,
  template: '',
})
class MockFeatureInfoOverlayComponent {
  public readonly showInteractiveElements = input(true);
}

@Component({
  selector: 'zoom-controls',
  standalone: true,
  template: '',
})
class MockZoomControlsComponent {
  public readonly showLocateMeButton = input(true);
}

describe('EmbeddedMapPageComponent', () => {
  let component: EmbeddedMapPageComponent;
  let fixture: ComponentFixture<EmbeddedMapPageComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: vi.fn((name: string): string | null => (name === RouteParamConstants.RESOURCE_IDENTIFIER ? 'test-id' : null)),
      },
    },
  };

  async function setupTest(parentLocation: string = 'b') {
    vi.stubGlobal('location', 'a');
    vi.stubGlobal('parent', {location: parentLocation});

    await TestBed.configureTestingModule({
      imports: [EmbeddedMapPageComponent],
      providers: [
        provideMockStore(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
      ],
    })
      .overrideComponent(EmbeddedMapPageComponent, {
        remove: {
          imports: [MapContainerComponent, LegendOverlayComponent, FeatureInfoOverlayComponent, ZoomControlsComponent],
        },
        add: {
          imports: [MockMapContainerComponent, MockLegendOverlayComponent, MockFeatureInfoOverlayComponent, MockZoomControlsComponent],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectNumberOfQueryLegends, 0);
    store.overrideSelector(selectApplicationInitializationLoadingState, undefined);
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(EmbeddedMapPageComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;

    fixture.detectChanges();
  }

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('with differing location and parent location', () => {
    beforeEach(async () => {
      await setupTest();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should read the resource identifier from the route', () => {
      expect(component.id()).toBe('test-id');
    });

    it('should initialize the application when a resource identifier is present', () => {
      expect(storeDispatchSpy).toHaveBeenCalledWith(ShareLinkActions.initializeApplicationBasedOnId({id: 'test-id'}));
    });

    it('should throw when the resource identifier is missing', () => {
      activatedRouteMock.snapshot.paramMap.get.mockReturnValueOnce(null);

      expect(() => TestBed.createComponent(EmbeddedMapPageComponent)).toThrow(ShareLinkParameterInvalid);
    });

    it('should render the embedded map page when embedded', () => {
      expect(compiled.querySelector('.embedded-map-page')).toBeTruthy();
      expect(compiled.textContent).toContain('Legende');
      expect(compiled.textContent).toContain('GIS Browser Zürich');
    });

    it('should render the map container when initialization has loaded', () => {
      store.overrideSelector(selectApplicationInitializationLoadingState, 'loaded');
      store.refreshState();

      fixture.detectChanges();

      expect(compiled.querySelector('map-container')).toBeTruthy();
    });

    it('should not render the map container while initialization is not loaded', () => {
      store.overrideSelector(selectApplicationInitializationLoadingState, 'loading');
      store.refreshState();

      fixture.detectChanges();

      expect(compiled.querySelector('map-container')).toBeNull();
    });

    it('should render the legend overlay in embedded mode', () => {
      const overlay = fixture.debugElement.query(By.directive(MockLegendOverlayComponent)).componentInstance as MockLegendOverlayComponent;

      expect(overlay).toBeTruthy();
      expect(overlay.showInteractiveElements()).toBe(false);
      expect(compiled.querySelector('.embedded-map-page__overlay')).toBeTruthy();
    });

    it('should render the feature info overlay in embedded mode', () => {
      const overlay = fixture.debugElement.query(By.directive(MockFeatureInfoOverlayComponent))
        .componentInstance as MockFeatureInfoOverlayComponent;

      expect(overlay).toBeTruthy();
      expect(overlay.showInteractiveElements()).toBe(false);
      expect(compiled.querySelector('.embedded-map-page__overlay--right')).toBeTruthy();
    });

    it('should render the zoom controls without the locate-me button', () => {
      const zoomControls = fixture.debugElement.query(By.directive(MockZoomControlsComponent))
        .componentInstance as MockZoomControlsComponent;

      expect(zoomControls.showLocateMeButton()).toBe(false);
      expect(compiled.querySelector('.embedded-map-page__zoom-controls')).toBeTruthy();
    });

    it('should render the minified header with the share link', () => {
      const link = compiled.querySelector('.embedded-map-page__minified-header') as HTMLAnchorElement;

      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toBe('/s/test-id');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.textContent).toContain('GIS Browser Zürich');
    });

    it('should disable the legend button when there are no query legends', () => {
      store.overrideSelector(selectNumberOfQueryLegends, 0);
      store.refreshState();

      fixture.detectChanges();

      const button = compiled.querySelector('.embedded-map-page__legend-button') as HTMLButtonElement;

      expect(button.disabled).toBe(true);
    });

    it('should enable the legend button when query legends exist', () => {
      store.overrideSelector(selectNumberOfQueryLegends, 2);
      store.refreshState();

      fixture.detectChanges();

      const button = compiled.querySelector('.embedded-map-page__legend-button') as HTMLButtonElement;

      expect(button.disabled).toBe(false);
    });

    it('should show the legend when the legend button is clicked', () => {
      store.overrideSelector(selectNumberOfQueryLegends, 1);
      store.refreshState();

      fixture.detectChanges();

      const button = compiled.querySelector('.embedded-map-page__legend-button') as HTMLButtonElement;

      button.click();

      expect(storeDispatchSpy).toHaveBeenCalledWith(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
    });

    it('should not dispatch when the disabled legend button is clicked', () => {
      store.overrideSelector(selectNumberOfQueryLegends, 0);
      store.refreshState();

      fixture.detectChanges();

      const button = compiled.querySelector('.embedded-map-page__legend-button') as HTMLButtonElement;

      button.click();

      expect(storeDispatchSpy).not.toHaveBeenCalledWith(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
    });
  });

  describe('with same location and parent location', () => {
    beforeEach(async () => {
      await setupTest('a');
    });

    it('should render the iframe warning when not embedded', () => {
      vi.stubGlobal('parent', {location: 'a'});
      fixture.detectChanges();

      expect(compiled.textContent).toContain('Diese Karte des GIS Browser Zürich muss in einem iframe verwendet werden.');
      expect(compiled.querySelector('.embedded-map-page')).toBeNull();
    });
  });
});
