import {TestBed} from '@angular/core/testing';
import {EsriToolService} from './esri-tool.service';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectDrawingLayers} from '../../../../state/map/selectors/drawing-layers.selector';
import {EsriMapMock} from '../../../../testing/map-testing/esri-map.mock';
import {EsriMapViewService} from '../esri-map-view.service';
import {EsriPointMeasurementStrategy} from './strategies/measurement/esri-point-measurement.strategy';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {UserDrawingLayer} from '../../../../shared/enums/drawing-layer.enum';
import {DrawingActiveMapItem} from '../../../models/implementations/drawing.model';
import {EsriLineMeasurementStrategy} from './strategies/measurement/esri-line-measurement.strategy';
import {EsriAreaMeasurementStrategy} from './strategies/measurement/esri-area-measurement.strategy';
import {take, tap} from 'rxjs';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {ActiveMapItemFactory} from '../../../../shared/factories/active-map-item.factory';
import {MapConstants} from '../../../../shared/constants/map.constants';

describe('EsriToolService', () => {
  let service: EsriToolService;
  let mapMock: EsriMapMock;
  let mapViewService: EsriMapViewService = new EsriMapViewService();
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({selectors: [{selector: selectDrawingLayers, value: []}]}),
        {
          provide: EsriMapViewService,
          useValue: mapViewService,
        },
      ],
    });
    service = TestBed.inject(EsriToolService);
    store = TestBed.inject(MockStore);

    TestBed.inject(EsriToolService);
    // mock the map view from Esri - otherwise any change to the layer list will create an error because the service call fails
    mapMock = new EsriMapMock([]);
    mapViewService = TestBed.inject(EsriMapViewService);
    mapViewService.mapView = {
      map: mapMock,
      addHandles<T>(handles: IHandle | IHandle[], groupKey?: GroupKey<T>) {},
      removeHandles<T>(groupKey?: GroupKey<T>) {},
      on(type: string | string[], listener: __esri.EventHandler): IHandle {
        return {} as IHandle;
      },
    } as __esri.MapView;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Visibility Handling', () => {
    let internalLayerId: string;
    beforeEach(() => {
      internalLayerId = MapConstants.INTERNAL_LAYER_PREFIX + UserDrawingLayer.Measurements;
    });

    it('forces visibility if layer is present by dispatching an action', () => {
      // add the graphic layer to the view to avoid the initialization
      mapViewService.mapView.map.layers.add(
        new GraphicsLayer({
          id: internalLayerId,
        }),
      );
      store.overrideSelector(selectDrawingLayers, [{id: internalLayerId} as DrawingActiveMapItem]);
      store.refreshState();

      service.initializeMeasurement('measure-point');

      store.scannedActions$
        .pipe(
          take(1),
          tap((lastAction) => {
            const expected = {
              activeMapItem: {id: internalLayerId},
              type: ActiveMapItemActions.forceFullVisibility.type,
            };
            expect(lastAction).toEqual(expected);
          }),
        )
        .subscribe();
    });
    it('adds a new mapitem if the layer is not present', () => {
      service.initializeMeasurement('measure-point');

      store.scannedActions$
        .pipe(
          take(1),
          tap((lastAction) => {
            const expected = {
              activeMapItem: ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Measurements, MapConstants.INTERNAL_LAYER_PREFIX),
              position: 0,
              type: ActiveMapItemActions.addActiveMapItem.type,
            };
            expect(lastAction).toEqual(expected);
          }),
        )
        .subscribe();
    });

    it('adds an Esri handle for this service group on drawing start', () => {
      // add the graphic layer to the view to avoid the initialization
      const spy = spyOn(mapViewService.mapView, 'addHandles');
      mapViewService.mapView.map.layers.add(
        new GraphicsLayer({
          id: internalLayerId,
        }),
      );
      store.overrideSelector(selectDrawingLayers, [{id: internalLayerId} as DrawingActiveMapItem]);
      store.refreshState();

      service.initializeMeasurement('measure-point');

      expect(spy).toHaveBeenCalledTimes(1);
      expect((spy.calls.first().args[0] as any).remove).toBeDefined(); // we know that it must be a WatchHandle
      expect(spy.calls.first().args[1]).toEqual('EsriToolService');
    });
  });

  describe('Strategy Handling', () => {
    beforeEach(() => {
      const internalLayerId = MapConstants.INTERNAL_LAYER_PREFIX + UserDrawingLayer.Measurements;
      // add the graphic layer to the view to avoid the initialization
      mapViewService.mapView.map.layers.add(
        new GraphicsLayer({
          id: internalLayerId,
        }),
      );
      store.overrideSelector(selectDrawingLayers, [{id: internalLayerId} as DrawingActiveMapItem]);
      store.refreshState();
    });
    it(`sets the correct strategy for point measurement`, () => {
      const pointSpy = spyOn(EsriPointMeasurementStrategy.prototype, 'start');
      service.initializeMeasurement('measure-point');
      expect(pointSpy).toHaveBeenCalled();
    });
    it(`sets the correct strategy for line measurement`, () => {
      const lineSpy = spyOn(EsriLineMeasurementStrategy.prototype, 'start');
      service.initializeMeasurement('measure-line');
      expect(lineSpy).toHaveBeenCalled();
    });
    it(`sets the correct strategy for area measurement`, () => {
      const polygonSpy = spyOn(EsriAreaMeasurementStrategy.prototype, 'start');
      service.initializeMeasurement('measure-area');
      expect(polygonSpy).toHaveBeenCalled();
    });
  });
});
