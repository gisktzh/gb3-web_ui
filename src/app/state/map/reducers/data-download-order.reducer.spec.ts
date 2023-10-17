import {initialState, reducer} from './data-download-order.reducer';
import {DataDownloadOrderState} from '../states/data-download-order.state';
import {DataDownloadOrderActions} from '../actions/data-download-order.actions';
import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {InternalDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {OrderStatus} from '../../../shared/interfaces/geoshop-order-status.interface';

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
  const orderStatusesMock: OrderStatus[] = [
    {
      orderId: 'fire nation attacks',
      status: {
        type: 'success',
      },
      submittedDateString: 'yes',
      finishedDateString: 'no',
      internalId: 1337,
    },
    {
      orderId: 'balance restored',
      status: {
        type: 'working',
        message: 'in process',
      },
      submittedDateString: 'February 21, 2005',
      finishedDateString: '',
      internalId: 42,
    },
    {
      orderId: 'sokka is hungry',
      status: {
        type: 'submitted',
      },
      submittedDateString: 'always',
      finishedDateString: 'never',
      internalId: 42_1337,
    },
  ];

  let existingState: DataDownloadOrderState;

  beforeEach(() => {
    existingState = {
      selection: selectionMock,
      orderStatuses: orderStatusesMock,
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
      expect(state.orderStatuses).toEqual(existingState.orderStatuses);
    });
  });

  describe('clearSelection', () => {
    it('clears the selection', () => {
      const action = DataDownloadOrderActions.clearSelection();
      const state = reducer(existingState, action);

      expect(state.selection).toBeUndefined();
      expect(state.orderStatuses).toEqual(existingState.orderStatuses);
    });
  });

  describe('setOrderStatus', () => {
    it('adds the order status to the list if no other status with the ID exists', () => {
      const expectedOrderStatus: OrderStatus = {
        orderId: 'selling cabbages',
        status: {
          type: 'failure',
          message: 'my cabbages!11!!',
        },
        submittedDateString: 'February 21, 2005',
        finishedDateString: 'July 19, 2008',
        internalId: 666,
      };
      const action = DataDownloadOrderActions.setOrderStatus({orderStatus: expectedOrderStatus});
      const state = reducer(existingState, action);

      expect(state.selection).toBe(existingState.selection);
      expect(state.orderStatuses).toEqual([...existingState.orderStatuses, expectedOrderStatus]);
    });

    it('replaces the existing order status in the list if there is a status with the same ID', () => {
      const expectedOrderStatus: OrderStatus = {
        orderId: existingState.orderStatuses[1].orderId,
        status: {
          type: 'failure',
          message: 'my cabbages!11!!',
        },
        submittedDateString: 'February 21, 2005',
        finishedDateString: 'July 19, 2008',
        internalId: 666,
      };
      const action = DataDownloadOrderActions.setOrderStatus({orderStatus: expectedOrderStatus});
      const state = reducer(existingState, action);

      expect(state.selection).toBe(existingState.selection);
      expect(state.orderStatuses).toEqual([existingState.orderStatuses[0], expectedOrderStatus, existingState.orderStatuses[2]]);
    });
  });
});
