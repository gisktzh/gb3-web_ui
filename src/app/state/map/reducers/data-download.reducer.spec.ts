import {initialState, reducer} from './data-download.reducer';
import {DataDownloadState} from '../states/data-download.state';
import {DataDownloadActions} from '../actions/data-download.actions';
import {Products} from '../../../shared/interfaces/geoshop-product.interface';
import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {InternalDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {OrderStatus} from '../../../shared/interfaces/geoshop-order-status.interface';

describe('data download reducer', () => {
  const productsMock: Products = {
    timestamp: '2023-10-09T11:50:02',
    formats: [
      {
        id: 1,
        name: 'Water (.nas)',
      },
      {
        id: 2,
        name: 'Earth (.erd)',
      },
      {
        id: 3,
        name: 'Fire (.hot)',
      },
      {
        id: 4,
        name: 'Air (.air)',
      },
    ],
    products: [
      {
        id: 112,
        name: 'Aang',
        description: 'Avatar',
        type: 'Vektor',
        formats: [1, 2, 3, 4],
      },
      {
        id: 14,
        name: 'Katara',
        description: 'Waterbender',
        type: 'Raster',
        formats: [1],
      },
    ],
    municipalities: [
      {
        id: '0001',
        name: 'Kyoshi Island',
      },
      {
        id: '0002',
        name: 'Omashu',
      },
      {
        id: '0003',
        name: 'Ba Sing Se',
      },
      {
        id: '0004',
        name: 'Southern Air Temple',
      },
      {
        id: '0005',
        name: 'Northern Water Tribe',
      },
    ],
  };
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
      submitted: 'yes',
      finished: 'no',
      internalId: 1337,
    },
    {
      orderId: 'balance restored',
      status: {
        type: 'working',
        message: 'in process',
      },
      submitted: 'February 21, 2005',
      finished: '',
      internalId: 42,
    },
    {
      orderId: 'sokka is hungry',
      status: {
        type: 'submitted',
      },
      submitted: 'always',
      finished: 'never',
      internalId: 42_1337,
    },
  ];

  const errorMock: Error = new Error('oh no! anyway...');
  let existingState: DataDownloadState;

  beforeEach(() => {
    existingState = {
      selection: selectionMock,
      products: productsMock,
      productsLoadingState: 'loaded',
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
      const action = DataDownloadActions.setSelection({selection: expectedSelection});
      const state = reducer(existingState, action);

      expect(state.selection).toBe(expectedSelection);
      expect(state.products).toBe(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.orderStatuses).toEqual(existingState.orderStatuses);
    });
  });

  describe('clearSelection', () => {
    it('clears the selection', () => {
      const action = DataDownloadActions.clearSelection();
      const state = reducer(existingState, action);

      expect(state.selection).toBeUndefined();
      expect(state.products).toBe(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.orderStatuses).toEqual(existingState.orderStatuses);
    });
  });

  describe('loadProducts', () => {
    it('sets the products loading state to `loading` if there are no products loaded yet', () => {
      existingState.products = undefined;
      const action = DataDownloadActions.loadProducts();
      const state = reducer(existingState, action);

      expect(state.selection).toBe(existingState.selection);
      expect(state.products).toBe(initialState.products);
      expect(state.productsLoadingState).toBe('loading');
      expect(state.orderStatuses).toEqual(existingState.orderStatuses);
    });

    it('changes nothing if there are already products in the state', () => {
      const action = DataDownloadActions.loadProducts();
      const state = reducer(existingState, action);

      expect(state.selection).toBe(existingState.selection);
      expect(state.products).toBe(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.orderStatuses).toEqual(existingState.orderStatuses);
    });
  });

  describe('setProducts', () => {
    it('sets the products loading state to `loaded` on success and sets the products', () => {
      existingState.productsLoadingState = 'loading';
      existingState.products = undefined;
      const action = DataDownloadActions.setProducts({products: productsMock});
      const state = reducer(existingState, action);

      expect(state.selection).toBe(existingState.selection);
      expect(state.products).toBe(productsMock);
      expect(state.productsLoadingState).toBe('loaded');
      expect(state.orderStatuses).toEqual(existingState.orderStatuses);
    });
  });

  describe('setProductsError', () => {
    it('sets the products loading state to `error` on failure and resets products', () => {
      const action = DataDownloadActions.setProductsError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.selection).toBe(existingState.selection);
      expect(state.products).toBe(initialState.products);
      expect(state.productsLoadingState).toBe('error');
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
        submitted: 'February 21, 2005',
        finished: 'July 19, 2008',
        internalId: 666,
      };
      const action = DataDownloadActions.setOrderStatus({orderStatus: expectedOrderStatus});
      const state = reducer(existingState, action);

      expect(state.selection).toBe(existingState.selection);
      expect(state.products).toBe(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.orderStatuses).toEqual([...existingState.orderStatuses, expectedOrderStatus]);
    });

    it('replaces the existing order status in the list if there is a status with the same ID', () => {
      const expectedOrderStatus: OrderStatus = {
        orderId: existingState.orderStatuses[1].orderId,
        status: {
          type: 'failure',
          message: 'my cabbages!11!!',
        },
        submitted: 'February 21, 2005',
        finished: 'July 19, 2008',
        internalId: 666,
      };
      const action = DataDownloadActions.setOrderStatus({orderStatus: expectedOrderStatus});
      const state = reducer(existingState, action);

      expect(state.selection).toBe(existingState.selection);
      expect(state.products).toBe(existingState.products);
      expect(state.productsLoadingState).toBe(existingState.productsLoadingState);
      expect(state.orderStatuses).toEqual([existingState.orderStatuses[0], expectedOrderStatus, existingState.orderStatuses[2]]);
    });
  });
});
