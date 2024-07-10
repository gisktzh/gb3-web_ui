import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {createExternalWmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {MapImportEffects} from './map-import.effects';
import {MapImportActions} from '../actions/map-import.actions';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {ExternalMapItemActions} from '../actions/external-map-item.actions';
import {MapServiceType} from '../../../map/types/map-service.type';
import {selectMapImportState, selectServiceType} from '../reducers/map-import.reducer';
import {selectAllSelectedLayer} from '../selectors/map-import-layer-selection.selector';
import {MapImportState} from '../states/map-import.state';
import {ExternalKmlLayer, ExternalWmsLayer} from '../../../shared/interfaces/external-layer.interface';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {UuidUtils} from '../../../shared/utils/uuid.utils';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

describe('MapImportEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: MapImportEffects;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        MapImportEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    effects = TestBed.inject(MapImportEffects);
    store = TestBed.inject(MockStore);
    spyOn(UuidUtils, 'createUuid').and.returnValue('not-a-real-uuid');
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('clearMapImportStateAfterAddingExternalMapItem$', () => {
    it('dispatches MapImportActions.clearAll() after adding external map items to the active maps', (done: DoneFn) => {
      const activeMapItem = createExternalWmsMapItemMock('url', 'test', []);

      const expectedAction = MapImportActions.clearAll();

      actions$ = of(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
      effects.clearMapImportStateAfterAddingExternalMapItem$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('clearExternalMapItemLoadingStateAfterChangingServiceType$', () => {
    it('dispatches ExternalMapItemActions.clearLoadingState() after setting a service type', (done: DoneFn) => {
      const expectedAction = ExternalMapItemActions.clearLoadingState();

      actions$ = of(MapImportActions.setServiceType({serviceType: 'wms'}));
      effects.clearExternalMapItemLoadingStateAfterChangingServiceType$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('clearExternalMapItemLoadingStateAfterClearingAll$', () => {
    it('dispatches ExternalMapItemActions.clearLoadingState() after clearing the map import state', (done: DoneFn) => {
      const expectedAction = ExternalMapItemActions.clearLoadingState();

      actions$ = of(MapImportActions.clearAll());
      effects.clearExternalMapItemLoadingStateAfterClearingAll$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('loadExternalMapItemAfterSettingUrl$', () => {
    it('dispatches ExternalMapItemActions.loadItem() after setting an URL and only if the service type is set', (done: DoneFn) => {
      const url = 'test-url';
      const serviceType: MapServiceType = 'wms';
      store.overrideSelector(selectServiceType, serviceType);

      const expectedAction = ExternalMapItemActions.loadItem({url, serviceType});

      actions$ = of(MapImportActions.setUrl({url}));
      effects.loadExternalMapItemAfterSettingUrl$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches nothing if the service type is not set', fakeAsync(() => {
      const url = 'test-url';
      store.overrideSelector(selectServiceType, undefined);

      let newAction;
      actions$ = of(MapImportActions.setUrl({url}));
      effects.loadExternalMapItemAfterSettingUrl$.subscribe((action) => (newAction = action));
      flush();

      expect(newAction).toBeUndefined();
    }));
  });

  describe('addExternalMapItemToMap$', () => {
    it('dispatches ActiveMapItemActions.addActiveMapItem() after importing an external WMS item', (done: DoneFn) => {
      const mapImportState: MapImportState = {
        serviceType: 'wms',
        url: 'wms-url',
        title: 'wms-title',
        imageFormat: 'wms-image-format',
        layerSelections: [],
      };
      const allSelectedLayers: ExternalWmsLayer[] = [
        {type: 'wms', id: 1, name: 'wms-layer-name-one', title: 'wms-layer-title-one', visible: true},
        {type: 'wms', id: 2, name: 'wms-layer-name-two', title: 'wms-layer-title-two', visible: false},
      ];
      store.overrideSelector(selectMapImportState, mapImportState);
      store.overrideSelector(selectAllSelectedLayer, allSelectedLayers);

      const expectedExternalMapItem = ActiveMapItemFactory.createExternalWmsMapItem(
        mapImportState.url!,
        mapImportState.title!,
        allSelectedLayers,
        mapImportState.imageFormat,
        true,
        1,
      );
      const expectedAction = ActiveMapItemActions.addActiveMapItem({activeMapItem: expectedExternalMapItem, position: 0});

      actions$ = of(MapImportActions.importExternalMapItem());
      effects.addExternalMapItemToMap$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches ActiveMapItemActions.addActiveMapItem() after importing an external KML item', (done: DoneFn) => {
      const mapImportState: MapImportState = {
        serviceType: 'kml',
        url: 'kml-url',
        title: 'kml-title',
        imageFormat: undefined,
        layerSelections: [],
      };
      const allSelectedLayers: ExternalKmlLayer[] = [
        {type: 'kml', id: 1, title: 'kml-layer-title-one', visible: true},
        {type: 'kml', id: 2, title: 'kml-layer-title-two', visible: false},
      ];
      store.overrideSelector(selectMapImportState, mapImportState);
      store.overrideSelector(selectAllSelectedLayer, allSelectedLayers);

      const expectedExternalMapItem = ActiveMapItemFactory.createExternalKmlMapItem(
        mapImportState.url!,
        mapImportState.title!,
        allSelectedLayers,
        true,
        1,
      );
      const expectedAction = ActiveMapItemActions.addActiveMapItem({activeMapItem: expectedExternalMapItem, position: 0});

      actions$ = of(MapImportActions.importExternalMapItem());
      effects.addExternalMapItemToMap$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches nothing if the service type is not set', fakeAsync(() => {
      const mapImportState: MapImportState = {
        serviceType: undefined,
        url: 'kml-url',
        title: 'kml-title',
        imageFormat: undefined,
        layerSelections: [],
      };
      store.overrideSelector(selectMapImportState, mapImportState);
      store.overrideSelector(selectAllSelectedLayer, []);

      let newAction;
      actions$ = of(MapImportActions.importExternalMapItem());
      effects.addExternalMapItemToMap$.subscribe((action) => (newAction = action));
      flush();

      expect(newAction).toBeUndefined();
    }));

    it('dispatches nothing if the url is not set', fakeAsync(() => {
      const mapImportState: MapImportState = {
        serviceType: 'kml',
        url: undefined,
        title: 'kml-title',
        imageFormat: undefined,
        layerSelections: [],
      };
      store.overrideSelector(selectMapImportState, mapImportState);
      store.overrideSelector(selectAllSelectedLayer, []);

      let newAction;
      actions$ = of(MapImportActions.importExternalMapItem());
      effects.addExternalMapItemToMap$.subscribe((action) => (newAction = action));
      flush();

      expect(newAction).toBeUndefined();
    }));

    it('dispatches nothing if the title is not set', fakeAsync(() => {
      const mapImportState: MapImportState = {
        serviceType: 'kml',
        url: 'kml-url',
        title: undefined,
        imageFormat: undefined,
        layerSelections: [],
      };
      store.overrideSelector(selectMapImportState, mapImportState);
      store.overrideSelector(selectAllSelectedLayer, []);

      let newAction;
      actions$ = of(MapImportActions.importExternalMapItem());
      effects.addExternalMapItemToMap$.subscribe((action) => (newAction = action));
      flush();

      expect(newAction).toBeUndefined();
    }));
  });
});
