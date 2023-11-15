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
        expect(response.timestampDateString).toBe(apiOrderResponseMock.timestamp);
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
      const configService = TestBed.inject(ConfigService);
      const httpClient = TestBed.inject(HttpClient);
      const postCallSpy = spyOn(httpClient, 'post').and.returnValue(of(apiOrderResponseMock));

      service.sendOrder(indirectOrderMock).subscribe((response) => {
        expect(response.orderId).toBe(apiOrderResponseMock.order_id);
        expect(response.timestampDateString).toBe(apiOrderResponseMock.timestamp);
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
        submittedDateString: 'February 21, 2005',
        finishedDateString: '',
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
