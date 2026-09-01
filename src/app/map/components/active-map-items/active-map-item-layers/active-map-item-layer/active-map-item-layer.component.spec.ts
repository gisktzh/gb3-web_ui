import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScale} from '../../../../../state/map/reducers/map-config.reducer';
import {ActiveMapItemActions} from '../../../../../state/map/actions/active-map-item.actions';
import {ActiveMapItem} from '../../../../models/active-map-item.model';
import {MapLayer} from '../../../../../shared/interfaces/topic.interface';
import {ActiveMapItemLayerComponent} from './active-map-item-layer.component';
import {inputBinding, signal} from '@angular/core';

describe('ActiveMapItemLayerComponent', () => {
  let component: ActiveMapItemLayerComponent;
  let fixture: ComponentFixture<ActiveMapItemLayerComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: ReturnType<typeof vi.spyOn>;

  const activeMapItem = signal({} as ActiveMapItem);
  const layer = signal({});

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveMapItemLayerComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScale, 1000);
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(ActiveMapItemLayerComponent, {
      bindings: [inputBinding('activeMapItem', activeMapItem), inputBinding('layer', layer)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('layer', () => {
    it('should display the layer title', () => {
      layer.set({
        id: 'layer-1',
        title: 'Test Layer',
        visible: true,
        minScale: 0,
        maxScale: 2000,
      });
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item-layer__title')?.textContent?.trim()).toBe('Test Layer');
    });

    it('should check the checkbox when the layer is visible', () => {
      layer.set({
        id: 'layer-1',
        title: 'Test Layer',
        visible: true,
        minScale: 0,
        maxScale: 2000,
      });
      fixture.detectChanges();

      const checkbox = compiled.querySelector<HTMLInputElement>('input[type="checkbox"]');

      expect(checkbox?.checked).toBe(true);
    });

    it('should not check the checkbox when the layer is hidden', () => {
      layer.set({
        id: 'layer-1',
        title: 'Test Layer',
        visible: false,
        minScale: 0,
        maxScale: 2000,
      });
      fixture.detectChanges();

      const checkbox = compiled.querySelector<HTMLInputElement>('input[type="checkbox"]');

      expect(checkbox?.checked).toBe(false);
    });

    it('should add the inactive class when the layer is hidden', () => {
      layer.set({
        id: 'layer-1',
        title: 'Test Layer',
        visible: false,
        minScale: 0,
        maxScale: 2000,
      });
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item-layer__title--inactive')).toBeTruthy();
    });

    it('should add the inactive class when the layer is outside the minimum scale', () => {
      layer.set({
        id: 'layer-1',
        title: 'Test Layer',
        visible: true,
        minScale: 2000,
        maxScale: 3000,
      });
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item-layer__title--inactive')).toBeTruthy();
    });

    it('should add the inactive class when the layer is outside the maximum scale', () => {
      layer.set({
        id: 'layer-1',
        title: 'Test Layer',
        visible: true,
        minScale: 0,
        maxScale: 500,
      });
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item-layer__title--inactive')).toBeTruthy();
    });

    it('should not add the inactive class when the layer is visible at the current scale', () => {
      activeMapItem.set({
        visible: true,
      } as ActiveMapItem);

      layer.set({
        id: 'layer-1',
        title: 'Test Layer',
        visible: true,
        minScale: 0,
        maxScale: 2000,
      });
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item-layer__title--inactive')).toBeNull();
    });
  });

  describe('active map item visibility', () => {
    it('should disable the checkbox when the active map item is not visible', () => {
      activeMapItem.set({visible: false} as ActiveMapItem);
      layer.set({
        id: 'layer-1',
        title: 'Test Layer',
        visible: true,
        minScale: 0,
        maxScale: 2000,
      });
      fixture.detectChanges();

      const checkbox = compiled.querySelector<HTMLInputElement>('input[type="checkbox"]');

      expect(checkbox?.disabled).toBe(true);
    });

    it('should enable the checkbox when the active map item is visible', () => {
      activeMapItem.set({visible: true} as ActiveMapItem);
      layer.set({
        id: 'layer-1',
        title: 'Test Layer',
        visible: true,
        minScale: 0,
        maxScale: 2000,
      });
      fixture.detectChanges();

      const checkbox = compiled.querySelector<HTMLInputElement>('input[type="checkbox"]');

      expect(checkbox?.disabled).toBe(false);
    });

    it('should add the inactive class when the active map item is not visible', () => {
      activeMapItem.set({visible: false} as ActiveMapItem);
      layer.set({
        id: 'layer-1',
        title: 'Test Layer',
        visible: true,
        minScale: 0,
        maxScale: 2000,
      });
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item-layer__title--inactive')).toBeTruthy();
    });
  });

  describe('toggleSublayerVisibility', () => {
    it('should dispatch an action to make a hidden layer visible', () => {
      const mapItem = {id: 'map-1', visible: true} as ActiveMapItem;
      const mapLayer: MapLayer = {
        id: 1,
        title: 'Test Layer',
        visible: false,
        minScale: 0,
        maxScale: 2000,
        layer: '',
        uuid: null,
        groupTitle: null,
        wmsSort: 0,
        tocSort: 0,
        queryable: false,
        isHidden: false,
      };

      activeMapItem.set(mapItem);
      layer.set(mapLayer);
      fixture.detectChanges();

      component.toggleSublayerVisibility(mapLayer);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.setSublayerVisibility({
          visible: true,
          activeMapItem: mapItem,
          layerId: 1,
        }),
      );
    });

    it('should dispatch an action to hide a visible layer', () => {
      const mapItem = {id: 'map-1', visible: true} as ActiveMapItem;
      const mapLayer: MapLayer = {
        id: 1,
        title: 'Test Layer',
        visible: true,
        minScale: 0,
        maxScale: 2000,
        layer: '',
        uuid: null,
        groupTitle: null,
        wmsSort: 0,
        tocSort: 0,
        queryable: false,
        isHidden: false,
      };

      activeMapItem.set(mapItem);
      layer.set(mapLayer);
      fixture.detectChanges();

      component.toggleSublayerVisibility(mapLayer);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.setSublayerVisibility({
          visible: false,
          activeMapItem: mapItem,
          layerId: 1,
        }),
      );
    });

    it('should toggle the layer visibility when the checkbox changes', () => {
      const mapItem = {id: 'map-1', visible: true} as ActiveMapItem;
      const mapLayer: MapLayer = {
        id: 1,
        title: 'Test Layer',
        visible: true,
        minScale: 0,
        maxScale: 2000,
        layer: '',
        uuid: null,
        groupTitle: null,
        wmsSort: 0,
        tocSort: 0,
        queryable: false,
        isHidden: false,
      };

      activeMapItem.set(mapItem);
      layer.set(mapLayer);
      fixture.detectChanges();

      const checkbox = compiled.querySelector<HTMLInputElement>('input[type="checkbox"]');

      checkbox?.click();

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.setSublayerVisibility({
          visible: false,
          activeMapItem: mapItem,
          layerId: 1,
        }),
      );
    });
  });

  describe('scale', () => {
    it('should update the inactive state when the scale changes', () => {
      layer.set({
        id: 'layer-1',
        title: 'Test Layer',
        visible: true,
        minScale: 0,
        maxScale: 2000,
      });
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item-layer__title--inactive')).toBeNull();

      store.overrideSelector(selectScale, 3000);
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item-layer__title--inactive')).toBeTruthy();
    });
  });
});
