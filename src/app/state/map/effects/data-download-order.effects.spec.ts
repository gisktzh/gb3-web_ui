import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {DataDownloadOrderEffects} from './data-download-order.effects';
import {DataDownloadOrderActions} from '../actions/data-download-order.actions';
import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {ConfigService} from '../../../shared/services/config.service';
import {MapUiActions} from '../actions/map-ui.actions';
import {InternalDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {ToolActions} from '../actions/tool.actions';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {selectActiveTool} from '../reducers/tool.reducer';
import {Order, OrderResponse} from '../../../shared/interfaces/geoshop-order.interface';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {selectOrder, selectSelection} from '../reducers/data-download-order.reducer';
import {GeoshopApiService} from '../../../shared/services/apis/geoshop/services/geoshop-api.service';
import {Polygon} from 'geojson';
import {OrderCouldNotBeSent, OrderSelectionIsInvalid, OrderUnsupportedGeometry} from '../../../shared/errors/data-download.errors';
import {HttpErrorResponse, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {selectMapSideDrawerContent} from '../reducers/map-ui.reducer';
import {selectProducts} from '../reducers/data-download-product.reducer';
import {DataDownloadOrderStatusJobActions} from '../actions/data-download-order-status-job.actions';
import {selectStatusJobs} from '../reducers/data-download-order-status-job.reducer';
import {catchError} from 'rxjs';
import {MAP_SERVICE} from '../../../app.tokens';

describe('DataDownloadOrderEffects', () => {
  const polygonSelectionMock: DataDownloadSelection = {
    type: 'polygon',
    drawingRepresentation: {
      id: 'id',
      type: 'Feature',
      source: InternalDrawingLayer.Selection,
      properties: {},
      geometry: MinimalGeometriesUtils.getMinimalPolygon(2056),
    },
  };

  const orderMock: Order = {
    perimeterType: 'direct',
    email: 'direct email',
    srs: 'lv95',
    geometry: MinimalGeometriesUtils.getMinimalPolygon(2056),
    products: [
      {
        id: 1337,
        formatId: 666,
      },
    ],
  };

  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: DataDownloadOrderEffects;
  let geoshopApiService: GeoshopApiService;
  let configService: ConfigService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        DataDownloadOrderEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    effects = TestBed.inject(DataDownloadOrderEffects);
    store = TestBed.inject(MockStore);
    geoshopApiService = TestBed.inject(GeoshopApiService);
    configService = TestBed.inject(ConfigService);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('createOrderFromSelection$', () => {
    it('creates an order from a valid selection and dispatches DataDownloadOrderActions.setOrder', () => {
      const geoshopApiServiceSpy = vi.spyOn(geoshopApiService, 'createOrderFromSelection');
      const selection = polygonSelectionMock;

      const expectedOrder: Order = {
        perimeterType: 'direct',
        srs: 'lv95',
        geometry: selection.drawingRepresentation.geometry as Polygon,
        products: [],
      };
      const expectedAction = DataDownloadOrderActions.setOrder({order: expectedOrder});

      actions$ = of(DataDownloadOrderActions.setSelection({selection}));
      effects.createOrderFromSelection$.subscribe((action) => {
        expect(geoshopApiServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopApiServiceSpy).toHaveBeenCalledWith(selection);
        expect(action).toEqual(expectedAction);
      });
    });

    it('does not create an order from an invalid selection and dispatches DataDownloadOrderActions.setSelectionError', () => {
      const geoshopApiServiceSpy = vi.spyOn(geoshopApiService, 'createOrderFromSelection');
      const invalidSelection: DataDownloadSelection = {
        type: 'polygon',
        drawingRepresentation: {
          id: 'id',
          type: 'Feature',
          source: InternalDrawingLayer.Selection,
          properties: {},
          geometry: MinimalGeometriesUtils.getMinimalMultiPolygon(2056),
        },
      };

      const expectedError = new OrderUnsupportedGeometry();
      const expectedAction = DataDownloadOrderActions.setSelectionError({error: expectedError});

      actions$ = of(DataDownloadOrderActions.setSelection({selection: invalidSelection}));
      effects.createOrderFromSelection$.subscribe((action) => {
        expect(geoshopApiServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopApiServiceSpy).toHaveBeenCalledWith(invalidSelection);
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('throwSelectionError$', () => {
    it('throws a OrderSelectionIsInvalid error in case of an original generic error', () => {
      const expectedOriginalError = new Error('oh no! anyway...');
      const expectedError = new OrderSelectionIsInvalid(expectedOriginalError);

      actions$ = of(DataDownloadOrderActions.setSelectionError({error: expectedOriginalError}));
      effects.throwSelectionError$
        .pipe(
          catchError((error: unknown) => {
            expect(error).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });

    it('throws an OrderUnsupportedGeometry error in case of original OrderUnsupportedGeometry', () => {
      const expectedError = new OrderUnsupportedGeometry();

      actions$ = of(DataDownloadOrderActions.setSelectionError({error: expectedError}));
      effects.throwSelectionError$
        .pipe(
          catchError((error: unknown) => {
            expect(error).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('clearSelectionAfterError$', () => {
    it('dispatches DataDownloadActions.clearSelection() after a selection error', () => {
      const expectedAction = DataDownloadOrderActions.clearSelection();

      actions$ = of(DataDownloadOrderActions.setSelectionError({}));
      effects.clearSelectionAfterError$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('zoomToSelection$', () => {
    it('zooms to the geometry extent using the map service, no further action dispatch', () => {
      const selection = polygonSelectionMock;
      const mapService = TestBed.inject(MAP_SERVICE);
      const mapServiceSpy = vi.spyOn(mapService, 'zoomToExtent');
      store.overrideSelector(selectSelection, selection);
      store.overrideSelector(selectMapSideDrawerContent, 'data-download');

      const expectedAction = MapUiActions.notifyMapSideDrawerAfterOpen();

      actions$ = of(expectedAction);
      effects.zoomToSelection$.subscribe(([[action, _], __]) => {
        expect(mapServiceSpy).toHaveBeenCalledTimes(1);
        expect(mapServiceSpy).toHaveBeenCalledWith(
          selection.drawingRepresentation.geometry,
          configService.mapAnimationConfig.zoom.expandFactor,
          configService.mapAnimationConfig.zoom.duration,
        );
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('openDataDownloadDrawerAfterSettingOrder$', () => {
    it('dispatches MapUiActions.showMapSideDrawerContent() after setting an order', () => {
      const expectedAction = MapUiActions.showMapSideDrawerContent({mapSideDrawerContent: 'data-download'});

      actions$ = of(DataDownloadOrderActions.setOrder({order: orderMock}));
      effects.openDataDownloadDrawerAfterSettingOrder$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('deactivateToolAfterClearingSelection$', () => {
    it('dispatches ToolActions.deactivateTool() after clearing the selection if the currently active tool is not undefined', () => {
      store.overrideSelector(selectActiveTool, 'select-polygon');

      const expectedAction = ToolActions.deactivateTool();

      actions$ = of(DataDownloadOrderActions.clearSelection());
      effects.deactivateToolAfterClearingSelection$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });

    it('does not dispatch an action after clearing the selection if the currently active tool is undefined', async () => {
      vi.useFakeTimers();

      store.overrideSelector(selectActiveTool, undefined);

      let actualAction;
      actions$ = of(DataDownloadOrderActions.clearSelection());
      effects.deactivateToolAfterClearingSelection$.subscribe((action) => (actualAction = action));
      await vi.runAllTimersAsync();

      expect(actualAction).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe('clearSelectionAfterClosingDataDownloadDrawer$', () => {
    it('dispatches DataDownloadActions.clearSelection() after hiding the map side drawer', () => {
      const expectedAction = DataDownloadOrderActions.clearSelection();

      actions$ = of(MapUiActions.hideMapSideDrawerContent());
      effects.clearSelectionAfterClosingDataDownloadDrawer$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('clearGeometryFromMap$', () => {
    it('removes the selection graphics using the map service, no further action dispatch', () => {
      const mapDrawingService = TestBed.inject(MapDrawingService);
      const mapDrawingServiceSpy = vi.spyOn(mapDrawingService, 'clearDataDownloadSelection');

      const expectedAction = DataDownloadOrderActions.clearSelection();

      actions$ = of(expectedAction);
      effects.clearGeometryFromMap$.subscribe((action) => {
        expect(mapDrawingServiceSpy).toHaveBeenCalledTimes(1);
        expect(mapDrawingServiceSpy).toHaveBeenCalledWith();
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('sendOrder$', () => {
    it('dispatches DataDownloadActions.setSendOrderResponse() with the service response on success', () => {
      const order = orderMock;
      store.overrideSelector(selectOrder, order);
      const orderResponse: OrderResponse = {
        orderId: 'first order',
        downloadUrl: 'something',
        statusUrl: 'something else',
        timestampDateString: 'a timestamp',
      };
      const geoshopApiServiceSpy = vi.spyOn(geoshopApiService, 'sendOrder').mockReturnValue(of(orderResponse));

      actions$ = of(DataDownloadOrderActions.sendOrder());
      effects.sendOrder$.subscribe((action) => {
        expect(geoshopApiServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopApiServiceSpy).toHaveBeenCalledWith(order);
        expect(action).toEqual(DataDownloadOrderActions.setSendOrderResponse({order, orderResponse}));
      });
    });

    it('dispatches DataDownloadActions.setSendOrderError() with the error on failure', () => {
      const order = orderMock;
      store.overrideSelector(selectOrder, order);
      const expectedError = new Error('nooooooooooooo!!!');
      const geoshopApiServiceSpy = vi.spyOn(geoshopApiService, 'sendOrder').mockReturnValue(throwError(() => expectedError));

      actions$ = of(DataDownloadOrderActions.sendOrder());
      effects.sendOrder$.subscribe((action) => {
        expect(geoshopApiServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopApiServiceSpy).toHaveBeenCalledWith(order);
        expect(action).toEqual(DataDownloadOrderActions.setSendOrderError({error: expectedError}));
      });
    });

    it('dispatches nothing if the order is undefined', async () => {
      vi.useFakeTimers();

      store.overrideSelector(selectOrder, undefined);
      const geoshopApiServiceSpy = vi.spyOn(geoshopApiService, 'sendOrder');

      let newAction;
      actions$ = of(DataDownloadOrderActions.sendOrder());
      effects.sendOrder$.subscribe((action) => (newAction = action));
      await vi.runAllTimersAsync();

      expect(geoshopApiServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe('throwSendOrderError$', () => {
    it('throws a OrderCouldNotBeSent error after setting a send order error', () => {
      const originalErrorText = 'that is no moon';
      const originalError = new HttpErrorResponse({statusText: originalErrorText});

      const expectedError = new OrderCouldNotBeSent(originalError, originalErrorText);

      actions$ = of(DataDownloadOrderActions.setSendOrderError({error: originalError}));
      effects.throwSendOrderError$
        .pipe(
          catchError((error: unknown) => {
            expect(error).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('closeDataDownloadDrawerAfterSendingAnOrderSuccessfully$', () => {
    it('dispatches MapUiActions.hideMapSideDrawerContent() after setting a send order response', () => {
      store.overrideSelector(selectMapSideDrawerContent, 'data-download');

      const expectedAction = MapUiActions.hideMapSideDrawerContent();

      actions$ = of(DataDownloadOrderActions.setSendOrderResponse({order: orderMock, orderResponse: {} as OrderResponse}));
      effects.closeDataDownloadDrawerAfterSendingAnOrderSuccessfully$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('showEmailConfirmationDialogAfterSendingAnOrderWithEmailSuccessfully$', () => {
    it('dispatches MapUiActions.hideMapSideDrawerContent() after setting a send order response of an order with an email address', () => {
      const expectedAction = MapUiActions.showDataDownloadEmailConfirmationDialog();

      actions$ = of(DataDownloadOrderActions.setSendOrderResponse({order: orderMock, orderResponse: {} as OrderResponse}));
      effects.showEmailConfirmationDialogAfterSendingAnOrderWithEmailSuccessfully$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('requestOrderStatusAfterSendingAnOrderWithoutEmailSuccessfully$', () => {
    it('dispatches DataDownloadOrderStatusJobActions.requestOrderStatus() after setting a send order response', () => {
      const order = {
        ...orderMock,
        email: undefined,
      };
      const orderResponse: OrderResponse = {
        orderId: 'first order',
        downloadUrl: 'something',
        statusUrl: 'something else',
        timestampDateString: 'a timestamp',
      };
      const orderTitle = 'grand moff';
      store.overrideSelector(selectProducts, []);
      store.overrideSelector(selectStatusJobs, []);
      const geoshopApiServiceSpy = vi.spyOn(geoshopApiService, 'createOrderTitle').mockReturnValue(orderTitle);

      const expectedAction = DataDownloadOrderStatusJobActions.requestOrderStatus({orderId: orderResponse.orderId, orderTitle});

      actions$ = of(DataDownloadOrderActions.setSendOrderResponse({order, orderResponse}));
      effects.requestOrderStatusAfterSendingAnOrderWithoutEmailSuccessfully$.subscribe((action) => {
        expect(geoshopApiServiceSpy).toHaveBeenCalledTimes(1);
        expect(geoshopApiServiceSpy).toHaveBeenCalledWith(order, []);
        expect(action).toEqual(expectedAction);
      });
    });
  });
});
