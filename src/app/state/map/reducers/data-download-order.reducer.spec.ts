import {initialState, reducer} from './data-download-order.reducer';
import {DataDownloadOrderState} from '../states/data-download-order.state';
import {DataDownloadOrderActions} from '../actions/data-download-order.actions';
import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {InternalDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {OrderStatus, OrderStatusJob} from '../../../shared/interfaces/geoshop-order-status.interface';

describe('data download order reducer', () => {
  const selectionMock: DataDownloadSelection = {
    type: 'select-polygon',
    drawingRepresentation: {
      id: 'id',
      type: 'Feature',
      source: InternalDrawingLayer.Selection,
      properties: {},
      geometry: {
        type: 'Polygon',
        srs: 2056,
        coordinates: [
          [
            [9, -23],
            [9, -17],
            [11, -17],
            [11, -23],
          ],
        ],
      },
    },
  };
  const statusJobsMock: OrderStatusJob[] = [
    {
      id: '1',
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
    },
    {
      id: '2',
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
    },
    {
      id: '3',
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
    },
  ];

  let existingState: DataDownloadOrderState;

  beforeEach(() => {
    existingState = {
      selection: selectionMock,
      order: undefined,
      savingState: 'loaded',
      statusJobs: statusJobsMock,
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('setSelection', () => {
    it('sets the selection', () => {
      const expectedSelection: DataDownloadSelection = {
        type: 'select-circle',
        drawingRepresentation: {
          id: 'new id',
          type: 'Feature',
          source: InternalDrawingLayer.Selection,
          properties: {},
          geometry: {
            type: 'Polygon',
            srs: 2056,
            coordinates: [
              [
                [123, -456],
                [987, -654],
                [123, -321],
                [123, -456],
              ],
            ],
          },
        },
      };
      const action = DataDownloadOrderActions.setSelection({selection: expectedSelection});
      const state = reducer(existingState, action);

      expect(state.selection).toBe(expectedSelection);
      expect(state.statusJobs).toEqual(existingState.statusJobs);
    });
  });

  describe('clearSelection', () => {
    it('clears the selection', () => {
      const action = DataDownloadOrderActions.clearSelection();
      const state = reducer(existingState, action);

      expect(state.selection).toBeUndefined();
      expect(state.statusJobs).toEqual(existingState.statusJobs);
    });
  });

  describe('setOrderStatusResponse', () => {
    it('adds the order status to the list if no other status with the ID exists', () => {
      const orderStatus: OrderStatus = {
        orderId: 'selling cabbages',
        status: {
          type: 'failure',
          message: 'my cabbages!11!!',
        },
        submittedDateString: 'February 21, 2005',
        finishedDateString: 'July 19, 2008',
        internalId: 666,
      };
      const action = DataDownloadOrderActions.setOrderStatusResponse({orderStatus});
      const state = reducer(existingState, action);

      const expectedOrderStatus: OrderStatusJob = {
        id: orderStatus.orderId,
        loadingState: 'loading',
        status: orderStatus,
      };

      expect(state.selection).toBe(existingState.selection);
      expect(state.statusJobs).toEqual([...existingState.statusJobs, expectedOrderStatus]);
    });

    it('replaces the existing order status in the list if there is a status with the same ID', () => {
      const orderStatus: OrderStatus = {
        orderId: existingState.statusJobs[1].id,
        status: {
          type: 'failure',
          message: 'my cabbages!11!!',
        },
        submittedDateString: 'February 21, 2005',
        finishedDateString: 'July 19, 2008',
        internalId: 666,
      };
      const action = DataDownloadOrderActions.setOrderStatusResponse({orderStatus});
      const state = reducer(existingState, action);

      const expectedOrderStatusJob: OrderStatusJob = {
        id: orderStatus.orderId,
        loadingState: 'loaded',
        status: orderStatus,
      };
      const expectedOrderStatusJobs: OrderStatusJob[] = [existingState.statusJobs[0], expectedOrderStatusJob, existingState.statusJobs[2]];

      expect(state.selection).toBe(existingState.selection);
      expect(state.statusJobs).toEqual(expectedOrderStatusJobs);
    });
  });
});
