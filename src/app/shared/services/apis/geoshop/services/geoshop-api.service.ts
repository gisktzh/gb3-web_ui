import {Injectable} from '@angular/core';
import {BaseApiService} from '../../abstract-api.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Products} from '../../../../interfaces/geoshop-product.interface';
import {
  Coordsys as ApiCoordsys,
  LayerName as ApiLayerName,
  Order as ApiOrder,
  OrderResponse as ApiOrderResponse,
  OrderStatus as ApiOrderStatus,
  Products as ApiProducts,
} from '../../../../models/geoshop-api-generated.interface';
import {DirectOrder, IndirectOrder, Order, OrderResponse} from '../../../../interfaces/geoshop-order.interface';
import {OrderStatus, OrderStatusContent, orderStatusKeys, OrderStatusType} from '../../../../interfaces/geoshop-order-status.interface';

@Injectable({
  providedIn: 'root',
})
export class GeoshopApiService extends BaseApiService {
  protected apiBaseUrl = this.configService.apiConfig.geoshopApi.baseUrl;

  public loadProducts(): Observable<Products> {
    const productsData = this.get<ApiProducts>(this.getFullEndpointUrl('products'));
    return productsData.pipe(map((data) => this.mapApiProductsToProducts(data)));
  }

  public sendOrder(order: Order): Observable<OrderResponse> {
    const orderData = this.mapOrderToApiOrder(order);
    return this.post<ApiOrder, ApiOrderResponse>(this.getFullEndpointUrl('order'), orderData).pipe(
      map((data) => this.mapApiOrderResponseToOrderResponse(data)),
    );
  }

  public checkOrderStatus(orderId: string): Observable<OrderStatus> {
    return this.get<ApiOrderStatus>(this.getFullOrderUrl('orders', orderId)).pipe(map((status) => this.mapApiOrderStatusToStatus(status)));
  }

  private getFullEndpointUrl(endpoint: string): string {
    return `${this.apiBaseUrl}/${endpoint}`;
  }

  private getFullOrderUrl(endpoint: string, orderId: string): string {
    return `${this.getFullEndpointUrl(endpoint)}/${orderId}`;
  }

  private mapApiProductsToProducts(data: ApiProducts): Products {
    return {
      timestampDateString: data.timestamp,
      products: data.products.map((product) => ({
        id: product.id,
        name: product.name,
        type: product.type,
        description: product.description,
        formats: product.formats,
      })),
      formats: data.formats.map((format) => ({
        id: format.id,
        name: format.name,
      })),
      municipalities: data.communes.map((commune) => ({
        id: commune.id,
        name: commune.name,
      })),
    };
  }

  private mapOrderToApiOrder(order: Order): ApiOrder {
    switch (order.perimeterType) {
      case 'direct':
        return this.mapDirectOrderToApiOrder(order);
      case 'indirect':
        return this.mapIndirectOrderToApiOrder(order);
    }
  }

  private mapDirectOrderToApiOrder(order: DirectOrder): ApiOrder {
    let apiCoordsys: ApiCoordsys;
    switch (order.srs) {
      case 'lv95':
        apiCoordsys = 'LV95';
        break;
      case 'lv03':
        apiCoordsys = 'LV03';
        break;
    }
    return {
      email: order.email,
      products: order.products.map((product) => ({
        product_id: product.id,
        format_id: product.formatId,
      })),
      perimeter_type: 'DIRECT',
      pdir_coordsys: apiCoordsys,
      pdir_polygon: order.geometry,
    };
  }

  private mapIndirectOrderToApiOrder(order: IndirectOrder): ApiOrder {
    let apiLayerName: ApiLayerName;
    switch (order.layerName) {
      case 'commune':
        apiLayerName = 'COMMUNE';
        break;
      case 'parcel':
        apiLayerName = 'PARCEL';
        break;
    }
    return {
      email: order.email,
      products: order.products.map((product) => ({
        product_id: product.id,
        format_id: product.formatId,
      })),
      perimeter_type: 'INDIRECT',
      pindir_ident: order.identifiers,
      pindir_layer_name: apiLayerName,
    };
  }

  private mapApiOrderResponseToOrderResponse(data: ApiOrderResponse): OrderResponse {
    return {
      orderId: data.order_id,
      downloadUrl: data.download_url,
      statusUrl: data.status_url,
      timestampDateString: data.timestamp,
    };
  }

  private mapApiOrderStatusToStatus(status: ApiOrderStatus): OrderStatus {
    return {
      orderId: status.order_id,
      finishedDateString: status.finished,
      internalId: status.internal_id,
      submittedDateString: status.submitted,
      status: this.parseStatus(status.status),
    };
  }

  /**
   * Parses the status from the API to an internal model
   *
   * Excerpt from the GeoShop API documentation:
   *   "For programmatic interpretation of the status codes, use the following rule: if a colon exists, extract the
   *    substring before the colon, otherwise the whole string. The extracted string is to be considered as a
   *    value of an enumeration set."
   */
  private parseStatus(apiStatus: string): OrderStatusContent {
    const splitStatus = apiStatus.split(':');
    const statusString = splitStatus[0].trim();
    const message = splitStatus.length === 2 ? splitStatus[1].trim() : undefined;
    const type: OrderStatusType = orderStatusKeys.find((statusKey) => statusKey === statusString) ?? 'unknown';
    return {type, message};
  }
}
