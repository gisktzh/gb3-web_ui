import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {selectIsAttributeFilterOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {selectMapAttributeFiltersItem} from '../../../state/map/selectors/map-attribute-filters-item.selector';
import {MapAttributeFilterComponent} from '../map-attribute-filter/map-attribute-filter.component';
import {MapOverlayComponent} from '../map-overlay/map-overlay.component';
import {MapAttributeFilterOverlayComponent} from './map-attribute-filter-overlay.component';
import {immerable} from 'immer';
import {Component, input, output} from '@angular/core';
import {ResizeHandlerLocation} from 'src/app/shared/types/resize-handler-location.type';
import {LoadingState} from 'src/app/shared/types/loading-state.type';

describe('MapAttributeFilterOverlayComponent', () => {
  let component: MapAttributeFilterOverlayComponent;
  let fixture: ComponentFixture<MapAttributeFilterOverlayComponent>;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  @Component({
    selector: 'map-overlay',
    template: '<div id="map-overlay"><ng-content /></div>',
  })
  class MockMapOverlayComponent {
    public readonly showPrintButton = input(true);
    public readonly isPrintButtonEnabled = input(false);
    public readonly printLoadingState = input<LoadingState>();
    public readonly isVisible = input(false);
    public readonly overlayTitle = input('');
    public readonly location = input<ResizeHandlerLocation>('left');
    public readonly closeEvent = output();
    public readonly printButtonEvent = output();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapAttributeFilterOverlayComponent],
      providers: [provideMockStore()],
    })
      .overrideComponent(MapAttributeFilterOverlayComponent, {
        remove: {
          imports: [MapOverlayComponent],
        },
        add: {
          imports: [MockMapOverlayComponent],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsAttributeFilterOverlayVisible, false);
    store.overrideSelector(selectMapAttributeFiltersItem, undefined);
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(MapAttributeFilterOverlayComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render the overlay when no attribute filter item is selected', () => {
    expect(fixture.debugElement.query(By.directive(MockMapOverlayComponent))).toBeNull();
    expect(fixture.debugElement.query(By.directive(MapAttributeFilterComponent))).toBeNull();
  });

  it('should render the overlay when an attribute filter item is selected', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, {
      title: 'Testfilter',
      settings: {
        type: 'gb2Wms',
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
      id: '',
      mapImageUrl: '',
      isSingleLayer: false,
      geometadataUuid: null,
      addToMap: vi.fn(),
      visible: false,
      opacity: 0,
      loadingState: undefined,
      viewProcessState: undefined,
      isTemporary: false,
      [immerable]: true,
    });
    store.refreshState();
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));
    const attributeFilter = fixture.debugElement.query(By.directive(MapAttributeFilterComponent));

    expect(overlay).toBeTruthy();
    expect(attributeFilter).toBeTruthy();
  });

  it('should pass the visibility state to the map overlay', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, {
      title: 'Testfilter',
      settings: {
        type: 'gb2Wms',
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
      id: '',
      mapImageUrl: '',
      isSingleLayer: false,
      geometadataUuid: null,
      addToMap: vi.fn(),
      visible: false,
      opacity: 0,
      loadingState: undefined,
      viewProcessState: undefined,
      isTemporary: false,
      [immerable]: true,
    });
    store.overrideSelector(selectIsAttributeFilterOverlayVisible, true);
    store.refreshState();
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));
    const overlayComponent = overlay.componentInstance;

    expect(overlayComponent.isVisible()).toBe(true);
  });

  it('should pass a hidden visibility state to the map overlay', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, {
      title: 'Testfilter',
      settings: {
        type: 'gb2Wms',
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
      id: '',
      mapImageUrl: '',
      isSingleLayer: false,
      geometadataUuid: null,
      addToMap: vi.fn(),
      visible: false,
      opacity: 0,
      loadingState: undefined,
      viewProcessState: undefined,
      isTemporary: false,
      [immerable]: true,
    });
    store.overrideSelector(selectIsAttributeFilterOverlayVisible, false);
    store.refreshState();
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));
    const overlayComponent = overlay.componentInstance;

    expect(overlayComponent.isVisible()).toBe(false);
  });

  it('should render the attribute filter item title in the overlay title', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, {
      title: 'Bevölkerung',
      settings: {
        type: 'gb2Wms',
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
      id: '',
      mapImageUrl: '',
      isSingleLayer: false,
      geometadataUuid: null,
      addToMap: vi.fn(),
      visible: false,
      opacity: 0,
      loadingState: undefined,
      viewProcessState: undefined,
      isTemporary: false,
      [immerable]: true,
    });
    store.refreshState();
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));
    const overlayComponent = overlay.componentInstance;

    expect(overlayComponent.overlayTitle()).toBe('Attributfilter: Bevölkerung');
  });

  it('should disable the print button', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, {
      title: 'Testfilter',
      settings: {
        type: 'gb2Wms',
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
      id: '',
      mapImageUrl: '',
      isSingleLayer: false,
      geometadataUuid: null,
      addToMap: vi.fn(),
      visible: false,
      opacity: 0,
      loadingState: undefined,
      viewProcessState: undefined,
      isTemporary: false,
      [immerable]: true,
    });
    store.refreshState();
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));
    const overlayComponent = overlay.componentInstance;

    expect(overlayComponent.showPrintButton()).toBe(false);
  });

  it('should dispatch the action when close is called', () => {
    component.close();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapUiActions.setAttributeFilterVisibility({isVisible: false}));
  });

  it('should dispatch the action when the map overlay emits closeEvent', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, {
      title: 'Testfilter',
      settings: {
        type: 'gb2Wms',
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
      id: '',
      mapImageUrl: '',
      isSingleLayer: false,
      geometadataUuid: null,
      addToMap: vi.fn(),
      visible: false,
      opacity: 0,
      loadingState: undefined,
      viewProcessState: undefined,
      isTemporary: false,
      [immerable]: true,
    });
    store.refreshState();
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));
    const overlayComponent = overlay.componentInstance;

    overlayComponent.closeEvent.emit();

    expect(storeDispatchSpy).toHaveBeenCalledWith(MapUiActions.setAttributeFilterVisibility({isVisible: false}));
  });

  it('should stop rendering the overlay when the attribute filter item becomes unavailable', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, {
      title: 'Testfilter',
      settings: {
        type: 'gb2Wms',
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
      id: '',
      mapImageUrl: '',
      isSingleLayer: false,
      geometadataUuid: null,
      addToMap: vi.fn(),
      visible: false,
      opacity: 0,
      loadingState: undefined,
      viewProcessState: undefined,
      isTemporary: false,
      [immerable]: true,
    });
    store.refreshState();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(MockMapOverlayComponent))).toBeTruthy();

    store.overrideSelector(selectMapAttributeFiltersItem, undefined);
    store.refreshState();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(MockMapOverlayComponent))).toBeNull();
    expect(fixture.debugElement.query(By.directive(MapAttributeFilterComponent))).toBeNull();
  });
});
