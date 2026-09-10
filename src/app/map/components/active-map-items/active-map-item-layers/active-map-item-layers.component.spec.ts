import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {ActiveMapItemLayersComponent} from './active-map-item-layers.component';
import {inputBinding, signal} from '@angular/core';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {immerable} from 'immer';

describe('ActiveMapItemLayersComponent', () => {
  let component: ActiveMapItemLayersComponent;
  let fixture: ComponentFixture<ActiveMapItemLayersComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const activeMapItem = signal({} as ActiveMapItem);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveMapItemLayersComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(ActiveMapItemLayersComponent, {
      bindings: [inputBinding('activeMapItem', activeMapItem)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    activeMapItem.set(createActiveMapItem());
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('shownLayers', () => {
    it('should return an empty array for non-gb2Wms map items', () => {
      activeMapItem.set({
        settings: {
          type: 'externalService',
          url: '',
          layers: [],
          mapServiceType: 'wms',
          imageFormat: 'png',
          [immerable]: true,
        },
        id: '',
        title: '',
        mapImageUrl: null,
        isSingleLayer: false,
        geometadataUuid: null,
        visible: false,
        opacity: 0,
        loadingState: undefined,
        viewProcessState: undefined,
        isTemporary: false,
        addToMap: vi.fn(),
        [immerable]: true,
      });
      fixture.detectChanges();

      expect(component.shownLayers()).toEqual([]);
    });

    it('should return visible gb2Wms layers', () => {
      const visibleLayer = createLayer({id: 1, isHidden: false});
      const hiddenLayer = createLayer({id: 2, isHidden: true});

      activeMapItem.set(
        createActiveMapItem({
          settings: {
            type: 'gb2Wms',
            layers: [visibleLayer, hiddenLayer],
            url: '',
            isNoticeMarkedAsRead: true,
            mapId: 'yes',
            [immerable]: true,
          },
        }),
      );
      fixture.detectChanges();

      expect(component.shownLayers()).toEqual([visibleLayer]);
    });

    it('should return an empty array when all gb2Wms layers are hidden', () => {
      activeMapItem.set(
        createActiveMapItem({
          settings: {
            type: 'gb2Wms',
            layers: [createLayer({isHidden: true}), createLayer({isHidden: true})],
            url: '',
            isNoticeMarkedAsRead: true,
            mapId: 'yes',
            [immerable]: true,
          },
        }),
      );
      fixture.detectChanges();

      expect(component.shownLayers()).toEqual([]);
    });
  });

  describe('template', () => {
    it('should render one item for each shown layer', () => {
      activeMapItem.set(
        createActiveMapItem({
          settings: {
            type: 'gb2Wms',
            layers: [createLayer({id: 1, isHidden: false}), createLayer({id: 2, isHidden: false}), createLayer({id: 3, isHidden: true})],
            url: '',
            isNoticeMarkedAsRead: true,
            mapId: 'yes',
            [immerable]: true,
          },
        }),
      );
      fixture.detectChanges();

      expect(compiled.querySelectorAll('active-map-item-layer')).toHaveLength(2);
    });

    it('should not render hidden layers', () => {
      activeMapItem.set(
        createActiveMapItem({
          settings: {
            type: 'gb2Wms',
            layers: [createLayer({isHidden: true})],
            url: '',
            isNoticeMarkedAsRead: true,
            mapId: 'yes',
            [immerable]: true,
          },
        }),
      );
      fixture.detectChanges();

      expect(compiled.querySelector('active-map-item-layer')).toBeNull();
    });

    it('should render no layers for a non-gb2Wms map item', () => {
      activeMapItem.set(
        createActiveMapItem({
          settings: {
            type: 'externalService',
            layers: [],
            url: '',
            [immerable]: true,
            mapServiceType: 'wms',
            imageFormat: 'png',
          },
        }),
      );
      fixture.detectChanges();

      expect(compiled.querySelector('active-map-item-layer')).toBeNull();
    });
  });

  describe('trackByLayerId', () => {
    it('should return the layer id', () => {
      const layer = createLayer({id: 123});

      expect(component.trackByLayerId(0, layer)).toBe(123);
    });
  });

  describe('dropSublayer', () => {
    it('should dispatch the reorder action', () => {
      const mapItem = createActiveMapItem();

      activeMapItem.set(mapItem);
      fixture.detectChanges();

      const dropEvent = {
        previousIndex: 2,
        currentIndex: 0,
      } as CdkDragDrop<CdkDrag>;

      component.dropSublayer(dropEvent);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.reorderSublayer({
          activeMapItem: mapItem,
          previousPosition: 2,
          currentPosition: 0,
        }),
      );
    });

    it('should dispatch the correct positions when moving a layer down', () => {
      const mapItem = createActiveMapItem();

      activeMapItem.set(mapItem);
      fixture.detectChanges();

      const dropEvent = {
        previousIndex: 0,
        currentIndex: 2,
      } as CdkDragDrop<CdkDrag>;

      component.dropSublayer(dropEvent);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.reorderSublayer({
          activeMapItem: mapItem,
          previousPosition: 0,
          currentPosition: 2,
        }),
      );
    });
  });

  function createLayer(overrides: Partial<MapLayer> = {}): MapLayer {
    return {
      id: 'layer-1',
      title: 'Layer 1',
      visible: true,
      isHidden: false,
      minScale: 0,
      maxScale: 10000,
      ...overrides,
    } as MapLayer;
  }

  function createActiveMapItem(overrides: Partial<ActiveMapItem> = {}): ActiveMapItem {
    return {
      id: 'map-1',
      title: 'Map 1',
      visible: true,
      settings: {
        type: 'gb2Wms',
        layers: [],
      },
      ...overrides,
    } as ActiveMapItem;
  }
});
