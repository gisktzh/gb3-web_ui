/* eslint-disable @typescript-eslint/naming-convention */
import {Injectable} from '@angular/core';
import {BaseApiService} from '../../abstract-api.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs';
import {
  Coordsys as ApiCoordsys,
  LayerName as ApiLayerName,
  Order as ApiOrder,
  OrderResponse as ApiOrderResponse,
  OrderStatus as ApiOrderStatus,
} from '../../../../models/geoshop-api-generated.interface';
import {DirectOrder, IndirectOrder, Order, OrderResponse} from '../../../../interfaces/geoshop-order.interface';
import {OrderStatus, OrderStatusContent, orderStatusKeys, OrderStatusType} from '../../../../interfaces/geoshop-order-status.interface';
import {
  DataDownloadSelection,
  GeometryDataDownloadSelection,
  MunicipalityDataDownloadSelection,
} from '../../../../interfaces/data-download-selection.interface';
import {Product} from '../../../../interfaces/gb3-geoshop-product.interface';
import {OrderUnsupportedGeometry} from '../../../../errors/data-download.errors';

@Injectable({
  providedIn: 'root',
})
export class GeoshopApiService extends BaseApiService {
  protected apiBaseUrl = this.configService.apiConfig.geoshopApi.baseUrl;

  public sendOrder(order: Order): Observable<OrderResponse> {
    const orderData = this.mapOrderToApiOrder(order);
    return this.post<ApiOrder, ApiOrderResponse>(this.getFullEndpointUrl('orders'), orderData).pipe(
      map((data) => this.mapApiOrderResponseToOrderResponse(data)),
    );
  }

  public checkOrderStatus(orderId: string): Observable<OrderStatus> {
    return this.get<ApiOrderStatus>(this.getFullOrderUrl('orders', orderId)).pipe(map((status) => this.mapApiOrderStatusToStatus(status)));
  }

  /**
   * This method is used to create an order depending on the given selection type.
   * - Indirect orders are using unique identifiers to select the area(s) to order from.
   * - Direct orders are using a geometry to do the same.
   * The canton is a special case - it is a direct order because there is no identifier available.
   */
  public createOrderFromSelection(selection: DataDownloadSelection): Order {
    switch (selection.type) {
      case 'polygon':
      case 'federation':
      case 'canton':
        return this.createDirectOrderFromSelection(selection);
      case 'municipality':
        return this.createIndirectOrderFromSelection(selection);
    }
  }

  public createOrderTitle(order: Order, products: Product[]): string {
    const uniqueProducts = new Set(
      order.products
        .map((orderProduct) => products.find((product) => product.gisZHNr === orderProduct.id)?.name)
        .filter((productName): productName is string => !!productName),
    );
    return Array.from(uniqueProducts).join(',');
  }

  public createOrderDownloadUrl(orderId: string): string {
    return `${this.getFullOrderUrl('orders', orderId)}/download`;
  }

  private createDirectOrderFromSelection(selection: GeometryDataDownloadSelection): Order {
    if (selection.drawingRepresentation.geometry.srs !== 2056 || selection.drawingRepresentation.geometry.type !== 'Polygon') {
      throw new OrderUnsupportedGeometry();
    }

    return {
      perimeterType: 'direct',
      products: [],
      srs: this.configService.dataDownloadConfig.defaultOrderSrs,
      geometry: selection.drawingRepresentation.geometry,
    };
  }

  private createIndirectOrderFromSelection(selection: MunicipalityDataDownloadSelection): Order {
    return {
      perimeterType: 'indirect',
      products: [],
      identifiers: [selection.municipality.bfsNo.toString()],
      layerName: 'commune',
    };
  }

  private getFullEndpointUrl(endpoint: string): string {
    return `${this.apiBaseUrl}/${endpoint}`;
  }

  private getFullOrderUrl(endpoint: string, orderId: string): string {
    return `${this.getFullEndpointUrl(endpoint)}/${orderId}`;
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
      email: order.email ?? '',
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
      email: order.email ?? '',
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
    const statusString = splitStatus[0].trim().toLowerCase();
    const message = splitStatus.length === 2 ? splitStatus[1].trim() : undefined;
    const type: OrderStatusType = orderStatusKeys.find((statusKey) => statusKey === statusString) ?? 'unknown';
    return {type, message};
  }
}
