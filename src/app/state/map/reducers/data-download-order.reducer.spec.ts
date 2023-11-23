import {initialState, reducer} from './data-download-order.reducer';
import {DataDownloadOrderState} from '../states/data-download-order.state';
import {DataDownloadOrderActions} from '../actions/data-download-order.actions';
import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {InternalDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {OrderStatus, OrderStatusJob} from '../../../shared/interfaces/geoshop-order-status.interface';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {Order, OrderResponse, Product} from '../../../shared/interfaces/geoshop-order.interface';

describe('data download order reducer', () => {
  const existingStateSelection: DataDownloadSelection = {
    type: 'select-polygon',
    drawingRepresentation: {
      id: 'id',
      type: 'Feature',
      source: InternalDrawingLayer.Selection,
      properties: {},
      geometry: MinimalGeometriesUtils.getMinimalPolygon(2056),
    },
  };
  const existingStateOrder: Order = {
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
  const existingStateStatusJobs: OrderStatusJob[] = [
    {
      id: '1',
      title: 'fire nation',
      loadingState: 'loaded',
      status: {
        orderId: 'fire nation attacks',
        status: {
          type: 'success',
        },
        submittedDateString: 'yes',
        finishedDateString: 'no',
        internalId: 1337,
      },
      consecutiveErrorsCount: 0,
      isCompleted: false,
      isAborted: false,
      isCancelled: false,
    },
    {
      id: '2',
      title: 'balance',
      loadingState: 'loading',
      status: {
        orderId: 'balance restored',
        status: {
          type: 'working',
          message: 'in process',
        },
        submittedDateString: 'February 21, 2005',
        finishedDateString: '',
        internalId: 42,
      },
      consecutiveErrorsCount: 0,
      isCompleted: false,
      isAborted: false,
      isCancelled: false,
    },
    {
      id: '3',
      title: 'sokka',
      loadingState: 'error',
      status: {
        orderId: 'sokka is not hungry',
        status: {
          type: 'failure',
        },
        submittedDateString: 'always',
        finishedDateString: 'never',
        internalId: 42_1337,
      },
      consecutiveErrorsCount: 0,
      isCompleted: false,
      isAborted: false,
      isCancelled: false,
    },
  ];
  const errorMock: Error = new Error('oh no! anyway...');

  let existingState: DataDownloadOrderState;

  beforeEach(() => {
    existingState = {
      selection: existingStateSelection,
      order: existingStateOrder,
      savingState: 'loaded',
      statusJobs: existingStateStatusJobs,
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('setSelection', () => {
    it('sets the selection, keeps the status jobs and resets everything else', () => {
      const expectedSelection: DataDownloadSelection = {
        type: 'select-circle',
        drawingRepresentation: {
          id: 'new id',
          type: 'Feature',
          source: InternalDrawingLayer.Selection,
          properties: {},
          geometry: MinimalGeometriesUtils.getMinimalPolygon(2056),
        },
      };
      const action = DataDownloadOrderActions.setSelection({selection: expectedSelection});
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(expectedSelection);
      expect(state.order).toEqual(initialState.order);
      expect(state.savingState).toBe(initialState.savingState);
      expect(state.statusJobs).toEqual(existingState.statusJobs);
    });
  });

  describe('clearSelection', () => {
    it('keeps the status jobs and resets everything else', () => {
      const action = DataDownloadOrderActions.clearSelection();
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(initialState.selection);
      expect(state.order).toEqual(initialState.order);
      expect(state.savingState).toBe(initialState.savingState);
      expect(state.statusJobs).toEqual(existingState.statusJobs);
    });
  });

  describe('setOrder', () => {
    it('sets the order and keeps everything else', () => {
      const newOrder: Order = {
        perimeterType: 'indirect',
        email: undefined,
        layerName: 'commune',
        identifiers: ['0001', '0002'],
        products: [
          {
            id: 42,
            formatId: 777,
          },
          {
            id: 1001,
            formatId: 9001,
          },
        ],
      };

      const action = DataDownloadOrderActions.setOrder({order: newOrder});
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(newOrder);
      expect(state.savingState).toBe(existingState.savingState);
      expect(state.statusJobs).toEqual(existingState.statusJobs);
    });
  });

  describe('updateProductsInOrder', () => {
    it('updates the current order by replacing existing products and keeps everything else', () => {
      const productId = existingState.order!.products[0].id;
      const formatIds = [1, 2, 2];

      const expectedProducts: Product[] = formatIds.map((formatId) => ({id: productId, formatId}));
      const expectedOrder: Order = {
        ...existingStateOrder,
        products: expectedProducts,
      };

      const action = DataDownloadOrderActions.updateProductsInOrder({productId, formatIds});
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(expectedOrder);
      expect(state.savingState).toBe(existingState.savingState);
      expect(state.statusJobs).toEqual(existingState.statusJobs);
    });
  });

  describe('removeProductsWithSameIdInOrder', () => {
    it('updates the current order by replacing existing products and keeps everything else', () => {
      const productId = existingState.order!.products[0].id;

      const expectedProducts: Product[] = [];
      const expectedOrder: Order = {
        ...existingStateOrder,
        products: expectedProducts,
      };

      const action = DataDownloadOrderActions.removeProductsWithSameIdInOrder({productId});
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(expectedOrder);
      expect(state.savingState).toBe(existingState.savingState);
      expect(state.statusJobs).toEqual(existingState.statusJobs);
    });
  });

  describe('setEmailInOrder', () => {
    it('updates the current order by replacing existing products and keeps everything else', () => {
      const email = 'new email';
      const expectedOrder: Order = {
        ...existingStateOrder,
        email,
      };

      const action = DataDownloadOrderActions.setEmailInOrder({email});
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(expectedOrder);
      expect(state.savingState).toBe(existingState.savingState);
      expect(state.statusJobs).toEqual(existingState.statusJobs);
    });
  });

  describe('sendOrder', () => {
    it('sets the saving state to loading and keeps everything else', () => {
      const action = DataDownloadOrderActions.sendOrder();
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(existingState.order);
      expect(state.savingState).toBe('loading');
      expect(state.statusJobs).toEqual(existingState.statusJobs);
    });
  });

  describe('setSendOrderResponse', () => {
    it('sets the saving state to loaded and keeps everything else', () => {
      const orderResponse: OrderResponse = {
        orderId: 'first order',
        downloadUrl: 'something',
        statusUrl: 'something else',
        timestampDateString: 'a timestamp',
      };
      existingState.savingState = 'loading';

      const action = DataDownloadOrderActions.setSendOrderResponse({order: existingStateOrder, orderResponse});
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(existingState.order);
      expect(state.savingState).toBe('loaded');
      expect(state.statusJobs).toEqual(existingState.statusJobs);
    });
  });

  describe('setSendOrderError', () => {
    it('sets the saving state to error and keeps everything else', () => {
      const action = DataDownloadOrderActions.setSendOrderError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(existingState.order);
      expect(state.savingState).toBe('error');
      expect(state.statusJobs).toEqual(existingState.statusJobs);
    });
  });

  describe('requestOrderStatus', () => {
    it('creates a new status job and adds it to the list if it does not exist yet; keeps everything else', () => {
      const orderId = '4';
      const orderTitle = 'appa';

      const expectedNewStatusJob: OrderStatusJob = {
        id: orderId,
        title: orderTitle,
        loadingState: 'loading',
        consecutiveErrorsCount: 0,
        isCompleted: false,
        isAborted: false,
        isCancelled: false,
      };
      const expectedStatusJobs: OrderStatusJob[] = [...existingState.statusJobs, expectedNewStatusJob];

      const action = DataDownloadOrderActions.requestOrderStatus({orderId, orderTitle});
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(existingState.order);
      expect(state.savingState).toBe(existingState.savingState);
      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });

    it('updates an existing status job; keeps everything else', () => {
      const orderId = '4';
      const orderTitle = 'appa';
      const existingStatusJob: OrderStatusJob = {
        id: orderId,
        title: orderTitle,
        loadingState: 'error',
        consecutiveErrorsCount: 0,
        isCompleted: false,
        isAborted: false,
        isCancelled: false,
      };
      existingState.statusJobs = [existingState.statusJobs[0], existingState.statusJobs[1], existingState.statusJobs[2], existingStatusJob];

      const expectedStatusJob: OrderStatusJob = {
        ...existingStatusJob,
        loadingState: 'loading',
      };
      const expectedStatusJobs: OrderStatusJob[] = [
        existingState.statusJobs[0],
        existingState.statusJobs[1],
        existingState.statusJobs[2],
        expectedStatusJob,
      ];

      const action = DataDownloadOrderActions.requestOrderStatus({orderId, orderTitle});
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(existingState.order);
      expect(state.savingState).toBe(existingState.savingState);
      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });
  });

  describe('setOrderStatusResponse', () => {
    it('updates an existing status job by setting its status to the given value, consecutiveErrorsCount to zero and loadingState to loaded; keeps everything else', () => {
      const existingStatusJob: OrderStatusJob = {
        ...existingState.statusJobs[1],
        status: undefined,
        consecutiveErrorsCount: 8,
        loadingState: 'error',
      };
      existingState.statusJobs = [existingState.statusJobs[0], existingStatusJob, existingState.statusJobs[2]];
      const orderStatus: OrderStatus = {
        orderId: existingStatusJob.id,
        status: {
          type: 'failure',
          message: 'my cabbages!11!!',
        },
        submittedDateString: 'February 21, 2005',
        finishedDateString: 'July 19, 2008',
        internalId: 666,
      };

      const expectedStatusJob: OrderStatusJob = {
        ...existingStatusJob,
        loadingState: 'loaded',
        status: orderStatus,
        consecutiveErrorsCount: 0,
      };
      const expectedStatusJobs: OrderStatusJob[] = [existingState.statusJobs[0], expectedStatusJob, existingState.statusJobs[2]];

      const action = DataDownloadOrderActions.setOrderStatusResponse({orderStatus});
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(existingState.order);
      expect(state.savingState).toBe(existingState.savingState);
      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });
  });

  describe('setOrderStatusError', () => {
    const maximumNumberOfConsecutiveStatusJobErrors = 10;

    it('updates an existing order status by setting its consecutiveErrorsCount to plus one and loadingState to error and isAborted to false if the error count is still under the maximum; keeps everything else', () => {
      const existingStatusJob: OrderStatusJob = {
        ...existingState.statusJobs[1],
        consecutiveErrorsCount: 8,
        loadingState: 'loading',
        isAborted: true,
      };
      existingState.statusJobs = [existingState.statusJobs[0], existingStatusJob, existingState.statusJobs[2]];

      const expectedStatusJob: OrderStatusJob = {
        ...existingStatusJob,
        consecutiveErrorsCount: 9,
        loadingState: 'error',
        isAborted: false,
      };
      const expectedStatusJobs: OrderStatusJob[] = [existingState.statusJobs[0], expectedStatusJob, existingState.statusJobs[2]];

      const action = DataDownloadOrderActions.setOrderStatusError({
        error: errorMock,
        orderId: existingStatusJob.id,
        maximumNumberOfConsecutiveStatusJobErrors,
      });
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(existingState.order);
      expect(state.savingState).toBe(existingState.savingState);
      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });

    it('updates an existing order status by setting its consecutiveErrorsCount to plus one and loadingState to error and isAborted to true if the error count is equal or over the maximum; keeps everything else', () => {
      const existingStatusJob: OrderStatusJob = {
        ...existingState.statusJobs[1],
        consecutiveErrorsCount: 9,
        loadingState: 'loading',
        isAborted: false,
      };
      existingState.statusJobs = [existingState.statusJobs[0], existingStatusJob, existingState.statusJobs[2]];

      const expectedStatusJob: OrderStatusJob = {
        ...existingStatusJob,
        consecutiveErrorsCount: 10,
        loadingState: 'error',
        isAborted: true,
      };
      const expectedStatusJobs: OrderStatusJob[] = [existingState.statusJobs[0], expectedStatusJob, existingState.statusJobs[2]];

      const action = DataDownloadOrderActions.setOrderStatusError({
        error: errorMock,
        orderId: existingStatusJob.id,
        maximumNumberOfConsecutiveStatusJobErrors,
      });
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(existingState.order);
      expect(state.savingState).toBe(existingState.savingState);
      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });
  });

  describe('completeOrderStatus', () => {
    it('updates an existing order status by setting its isCompleted to true; keeps everything else', () => {
      const existingStatusJob: OrderStatusJob = {
        ...existingState.statusJobs[1],
        isCompleted: false,
      };
      existingState.statusJobs = [existingState.statusJobs[0], existingStatusJob, existingState.statusJobs[2]];

      const expectedStatusJob: OrderStatusJob = {
        ...existingStatusJob,
        isCompleted: true,
      };
      const expectedStatusJobs: OrderStatusJob[] = [existingState.statusJobs[0], expectedStatusJob, existingState.statusJobs[2]];

      const action = DataDownloadOrderActions.completeOrderStatus({orderId: existingStatusJob.id});
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(existingState.order);
      expect(state.savingState).toBe(existingState.savingState);
      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });
  });

  describe('cancelOrderStatus', () => {
    it('updates an existing order status by setting its isCompleted to true; keeps everything else', () => {
      const existingStatusJob: OrderStatusJob = {
        ...existingState.statusJobs[1],
        isCancelled: false,
      };
      existingState.statusJobs = [existingState.statusJobs[0], existingStatusJob, existingState.statusJobs[2]];

      const expectedStatusJob: OrderStatusJob = {
        ...existingStatusJob,
        isCancelled: true,
      };
      const expectedStatusJobs: OrderStatusJob[] = [existingState.statusJobs[0], expectedStatusJob, existingState.statusJobs[2]];

      const action = DataDownloadOrderActions.cancelOrderStatus({orderId: existingStatusJob.id});
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(existingState.order);
      expect(state.savingState).toBe(existingState.savingState);
      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });
  });
});
