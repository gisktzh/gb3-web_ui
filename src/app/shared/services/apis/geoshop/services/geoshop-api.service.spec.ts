import {TestBed} from '@angular/core/testing';

import {GeoshopApiService} from './geoshop-api.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {
  Order as ApiOrder,
  OrderResponse as ApiOrderResponse,
  OrderStatus as ApiOrderStatus,
  Products as ApiProducts,
} from '../../../../models/geoshop-api-generated.interface';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {OrderStatus} from '../../../../interfaces/geoshop-order-status.interface';
import {ConfigService} from '../../../config.service';
import {Order} from '../../../../interfaces/geoshop-order.interface';
import {MinimalGeometriesUtils} from '../../../../../testing/map-testing/minimal-geometries.utils';

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

  describe('loadProducts', () => {
    const mockData: ApiProducts = {
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
      communes: [
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

    it('should receive the data and transform it', (done: DoneFn) => {
      const httpClient = TestBed.inject(HttpClient);
      spyOn(httpClient, 'get').and.returnValue(of(mockData));
      service.loadProducts().subscribe((products) => {
        expect(products).toBeDefined();
        expect(products.timestamp).toBe(mockData.timestamp);
        expect(products.products).toEqual(jasmine.arrayWithExactContents(mockData.products));
        expect(products.formats).toEqual(jasmine.arrayWithExactContents(mockData.formats));
        expect(products.municipalities).toEqual(jasmine.arrayWithExactContents(mockData.communes));
        done();
      });
    });
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
      email: 'indirect email',
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
      const configService = TestBed.inject(ConfigService);
      const httpClient = TestBed.inject(HttpClient);
      const postCallSpy = spyOn(httpClient, 'post').and.returnValue(of(apiOrderResponseMock));

      service.sendOrder(directOrderMock).subscribe((response) => {
        expect(response.orderId).toBe(apiOrderResponseMock.order_id);
        expect(response.timestamp).toBe(apiOrderResponseMock.timestamp);
        expect(response.statusUrl).toBe(apiOrderResponseMock.status_url);
        expect(response.downloadUrl).toBe(apiOrderResponseMock.download_url);
        expect(postCallSpy).toHaveBeenCalledOnceWith(`${configService.apiConfig.geoshopApi.baseUrl}/order`, expectedDirectApiOrder, {
          headers: undefined,
        });
        done();
      });
    });

    it('should transform and send (indirect) order jobs', (done: DoneFn) => {
      const expectedIndirectApiOrder: ApiOrder = {
        perimeter_type: 'INDIRECT',
        email: 'indirect email',
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
      const configService = TestBed.inject(ConfigService);
      const httpClient = TestBed.inject(HttpClient);
      const postCallSpy = spyOn(httpClient, 'post').and.returnValue(of(apiOrderResponseMock));

      service.sendOrder(indirectOrderMock).subscribe((response) => {
        expect(response.orderId).toBe(apiOrderResponseMock.order_id);
        expect(response.timestamp).toBe(apiOrderResponseMock.timestamp);
        expect(response.statusUrl).toBe(apiOrderResponseMock.status_url);
        expect(response.downloadUrl).toBe(apiOrderResponseMock.download_url);
        expect(postCallSpy).toHaveBeenCalledOnceWith(`${configService.apiConfig.geoshopApi.baseUrl}/order`, expectedIndirectApiOrder, {
          headers: undefined,
        });
        done();
      });
    });
  });

  describe('checkOrderStatus', () => {
    const apiOrderStatusMock: ApiOrderStatus = {
      order_id: 'balance restored',
      status: 'working: in process',
      submitted: 'February 21, 2005',
      finished: '',
      internal_id: 42,
      order: {
        perimeter_type: 'INDIRECT',
        pindir_layer_name: 'PARCEL',
        pindir_ident: [],
        products: [],
        email: 'aang@avatar.org',
      },
    };

    it('should check the order status and transform the response', (done: DoneFn) => {
      const expectedOrderStatus: OrderStatus = {
        orderId: 'balance restored',
        status: {
          type: 'working',
          message: 'in process',
        },
        submitted: 'February 21, 2005',
        finished: '',
        internalId: 42,
      };
      const httpClient = TestBed.inject(HttpClient);
      const getCallSpy = spyOn(httpClient, 'get').and.returnValue(of(apiOrderStatusMock));

      service.checkOrderStatus('balance restored').subscribe((response) => {
        expect(response).toEqual(expectedOrderStatus);
        expect(getCallSpy).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
});
