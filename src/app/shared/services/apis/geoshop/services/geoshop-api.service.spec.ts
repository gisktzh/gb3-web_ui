/* eslint-disable @typescript-eslint/naming-convention */
import {TestBed} from '@angular/core/testing';

import {GeoshopApiService} from './geoshop-api.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {
  Order as ApiOrder,
  OrderResponse as ApiOrderResponse,
  OrderStatus as ApiOrderStatus,
} from '../../../../models/geoshop-api-generated.interface';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {OrderStatus} from '../../../../interfaces/geoshop-order-status.interface';
import {ConfigService} from '../../../config.service';
import {Order} from '../../../../interfaces/geoshop-order.interface';
import {MinimalGeometriesUtils} from '../../../../../testing/map-testing/minimal-geometries.utils';
import {DataDownloadSelection} from '../../../../interfaces/data-download-selection.interface';
import {InternalDrawingLayer} from '../../../../enums/drawing-layer.enum';
import {OrderUnsupportedGeometry} from '../../../../errors/data-download.errors';
import {Product} from '../../../../interfaces/gb3-geoshop-product.interface';

describe('GeoshopApiService', () => {
  let service: GeoshopApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(GeoshopApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sendOrder', () => {
    const directOrderMock: Order = {
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
    const indirectOrderMock: Order = {
      perimeterType: 'indirect',
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

    const apiOrderResponseMock: ApiOrderResponse = {
      order_id: 'sokka is hungry',
      timestamp: '01-02-3456 01:34:567',
      status_url: `https://www.example.com/status`,
      download_url: `https://www.example.com/download`,
    };

    it('should transform and send (direct) order jobs', (done: DoneFn) => {
      const configService = TestBed.inject(ConfigService);
      const httpClient = TestBed.inject(HttpClient);
      const postCallSpy = spyOn(httpClient, 'post').and.returnValue(of(apiOrderResponseMock));

      const expectedDirectApiOrder: ApiOrder = {
        perimeter_type: 'DIRECT',
        email: 'direct email',
        pdir_coordsys: 'LV95',
        pdir_polygon: MinimalGeometriesUtils.getMinimalPolygon(2056),
        products: [
          {
            product_id: 1337,
            format_id: 666,
          },
        ],
      };

      service.sendOrder(directOrderMock).subscribe((response) => {
        expect(response.orderId).toBe(apiOrderResponseMock.order_id);
        expect(response.timestampDateString).toBe(apiOrderResponseMock.timestamp);
        expect(response.statusUrl).toBe(apiOrderResponseMock.status_url);
        expect(response.downloadUrl).toBe(apiOrderResponseMock.download_url);
        expect(postCallSpy).toHaveBeenCalledOnceWith(`${configService.apiConfig.geoshopApi.baseUrl}/orders`, expectedDirectApiOrder, {
          headers: undefined,
        });
        done();
      });
    });

    it('should transform and send (indirect) order jobs', (done: DoneFn) => {
      const configService = TestBed.inject(ConfigService);
      const httpClient = TestBed.inject(HttpClient);
      const postCallSpy = spyOn(httpClient, 'post').and.returnValue(of(apiOrderResponseMock));

      const expectedIndirectApiOrder: ApiOrder = {
        perimeter_type: 'INDIRECT',
        email: '',
        pindir_ident: ['0001', '0002'],
        pindir_layer_name: 'COMMUNE',
        products: [
          {
            product_id: 42,
            format_id: 777,
          },
          {
            product_id: 1001,
            format_id: 9001,
          },
        ],
      };

      service.sendOrder(indirectOrderMock).subscribe((response) => {
        expect(response.orderId).toBe(apiOrderResponseMock.order_id);
        expect(response.timestampDateString).toBe(apiOrderResponseMock.timestamp);
        expect(response.statusUrl).toBe(apiOrderResponseMock.status_url);
        expect(response.downloadUrl).toBe(apiOrderResponseMock.download_url);
        expect(postCallSpy).toHaveBeenCalledOnceWith(`${configService.apiConfig.geoshopApi.baseUrl}/orders`, expectedIndirectApiOrder, {
          headers: undefined,
        });
        done();
      });
    });
  });

  describe('checkOrderStatus', () => {
    it('should check the order status and transform the response', (done: DoneFn) => {
      const apiOrderStatusMock: ApiOrderStatus = {
        order_id: 'balance restored',
        status: 'WORKING: in process',
        submitted: '2017-11-10T16:16:11',
        finished: '2017-11-10T16:17:07',
        internal_id: 42,
        order: {
          perimeter_type: 'INDIRECT',
          pindir_layer_name: 'PARCEL',
          pindir_ident: [],
          products: [],
          email: 'aang@avatar.org',
        },
      };
      const orderId = 'balance restored';
      const configService = TestBed.inject(ConfigService);
      const httpClient = TestBed.inject(HttpClient);
      const getCallSpy = spyOn(httpClient, 'get').and.returnValue(of(apiOrderStatusMock));

      const expectedOrderStatus: OrderStatus = {
        orderId: 'balance restored',
        status: {
          type: 'working',
          message: 'in process',
        },
        submittedDateString: '2017-11-10T16:16:11',
        finishedDateString: '2017-11-10T16:17:07',
        internalId: 42,
      };

      service.checkOrderStatus(orderId).subscribe((response) => {
        expect(response).toEqual(expectedOrderStatus);
        expect(getCallSpy).toHaveBeenCalledOnceWith(`${configService.apiConfig.geoshopApi.baseUrl}/orders/${orderId}`);
        done();
      });
    });
  });

  describe('createOrderFromSelection', () => {
    it('creates an indirect order from a municipality selection', () => {
      const selection: DataDownloadSelection = {
        type: 'select-municipality',
        drawingRepresentation: {
          id: 'id',
          type: 'Feature',
          source: InternalDrawingLayer.Selection,
          properties: {},
          geometry: MinimalGeometriesUtils.getMinimalPolygon(2056),
        },
        municipality: {name: 'Blazingville', bfsNo: 420},
      };

      const expected: Order = {
        perimeterType: 'indirect',
        products: [],
        layerName: 'commune',
        identifiers: ['420'],
      };
      const actual = service.createOrderFromSelection(selection);
      expect(actual).toEqual(expected);
    });

    it('creates a direct order from a rectangle selection', () => {
      const configService = TestBed.inject(ConfigService);
      const geometry = MinimalGeometriesUtils.getMinimalPolygon(2056);
      const selection: DataDownloadSelection = {
        type: 'select-rectangle',
        drawingRepresentation: {
          id: 'id',
          type: 'Feature',
          source: InternalDrawingLayer.Selection,
          properties: {},
          geometry,
        },
      };

      const expected: Order = {
        perimeterType: 'direct',
        products: [],
        srs: configService.dataDownloadConfig.defaultOrderSrs,
        geometry,
      };
      const actual = service.createOrderFromSelection(selection);
      expect(actual).toEqual(expected);
    });

    it('throws an OrderUnsupportedGeometry error if the geometry is not of type polygon', () => {
      const selection: DataDownloadSelection = {
        type: 'select-polygon',
        drawingRepresentation: {
          id: 'id',
          type: 'Feature',
          source: InternalDrawingLayer.Selection,
          properties: {},
          geometry: MinimalGeometriesUtils.getMinimalMultiPolygon(2056),
        },
      };

      const expectedError = new OrderUnsupportedGeometry();

      expect(() => service.createOrderFromSelection(selection)).toThrow(expectedError);
    });

    it('throws an OrderUnsupportedGeometry error if the geometry is not in SRS 2056', () => {
      const selection: DataDownloadSelection = {
        type: 'select-polygon',
        drawingRepresentation: {
          id: 'id',
          type: 'Feature',
          source: InternalDrawingLayer.Selection,
          properties: {},
          geometry: MinimalGeometriesUtils.getMinimalPolygon(4326),
        },
      };

      const expectedError = new OrderUnsupportedGeometry();

      expect(() => service.createOrderFromSelection(selection)).toThrow(expectedError);
    });
  });

  describe('createOrderTitle', () => {
    it('creates an order title by combining the name of all products', () => {
      const order: Order = {
        perimeterType: 'indirect',
        products: [
          {id: 9001, formatId: 0},
          {id: 42, formatId: 0},
        ],
        layerName: 'commune',
        identifiers: [],
      };
      const products: Product[] = [
        {
          gisZHNr: 42,
          name: 'Answer to the Ultimate Question of Life, the Universe, and Everything',
          id: '',
          ogd: true,
          themes: [],
          keywords: [],
          formats: [],
        },
        {
          gisZHNr: 9001,
          name: `It's over 9000!`,
          id: '',
          ogd: true,
          themes: [],
          keywords: [],
          formats: [],
        },
        {
          gisZHNr: 666,
          name: `cat`,
          id: '',
          ogd: true,
          themes: [],
          keywords: [],
          formats: [],
        },
      ];

      const expected = `It's over 9000!,Answer to the Ultimate Question of Life, the Universe, and Everything`;
      const actual = service.createOrderTitle(order, products);
      expect(actual).toBe(expected);
    });
  });

  describe('createOrderDownloadUrl', () => {
    it('creates the full download URL from the given order ID', () => {
      const configService = TestBed.inject(ConfigService);
      const orderId = 'It is finally over';

      const expected = `${configService.apiConfig.geoshopApi.baseUrl}/orders/${orderId}/download`;
      const actual = service.createOrderDownloadUrl(orderId);
      expect(actual).toBe(expected);
    });
  });
});
