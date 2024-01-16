import {initialState, reducer} from './data-download-order.reducer';
import {DataDownloadOrderState} from '../states/data-download-order.state';
import {DataDownloadOrderActions} from '../actions/data-download-order.actions';
import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {InternalDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {Order, OrderResponse, Product} from '../../../shared/interfaces/geoshop-order.interface';

describe('data download order reducer', () => {
  const existingStateSelection: DataDownloadSelection = {
    type: 'polygon',
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
  const errorMock: Error = new Error('oh no! anyway...');

  let existingState: DataDownloadOrderState;

  beforeEach(() => {
    existingState = {
      selection: existingStateSelection,
      order: existingStateOrder,
      savingState: 'loaded',
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
    it('sets the selection; resets everything else', () => {
      const expectedSelection: DataDownloadSelection = {
        type: 'canton',
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
    });
  });

  describe('clearSelection', () => {
    it('resets everything', () => {
      const action = DataDownloadOrderActions.clearSelection();
      const state = reducer(existingState, action);

      expect(state).toEqual(initialState);
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
    });
  });

  describe('updateProductsInOrder', () => {
    it('updates the current order by replacing existing products; keeps everything else', () => {
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
    });
  });

  describe('removeProductsWithSameIdInOrder', () => {
    it('updates the current order by replacing existing products; keeps everything else', () => {
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
    });
  });

  describe('setEmailInOrder', () => {
    it('updates the current order by replacing existing products; keeps everything else', () => {
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
    });
  });

  describe('sendOrder', () => {
    it('sets the saving state to loading; keeps everything else', () => {
      const action = DataDownloadOrderActions.sendOrder();
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(existingState.order);
      expect(state.savingState).toBe('loading');
    });
  });

  describe('setSendOrderResponse', () => {
    it('sets the saving state to loaded; keeps everything else', () => {
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
    });
  });

  describe('setSendOrderError', () => {
    it('sets the saving state to error; keeps everything else', () => {
      const action = DataDownloadOrderActions.setSendOrderError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.selection).toEqual(existingState.selection);
      expect(state.order).toEqual(existingState.order);
      expect(state.savingState).toBe('error');
    });
  });
});
