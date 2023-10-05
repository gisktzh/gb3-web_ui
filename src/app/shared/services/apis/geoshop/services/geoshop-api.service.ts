import {Injectable} from '@angular/core';
import {BaseApiService} from '../../abstract-api.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Products} from '../../../../interfaces/geoshop-product.interface';
import {Products as ApiProducts} from '../../../../models/geoshop-api-generated.interface';

@Injectable({
  providedIn: 'root',
})
export class GeoshopApiService extends BaseApiService {
  protected apiBaseUrl = this.configService.apiConfig.geoshopApi.baseUrl;

  public loadProducts(): Observable<Products> {
    const productsData = this.get<ApiProducts>(this.getFullEndpointUrl('products'));
    return productsData.pipe(map((data) => this.mapApiProductsToProducts(data)));
  }

  private getFullEndpointUrl(endpoint: string): string {
    return `${this.apiBaseUrl}/${endpoint}`;
  }

  private mapApiProductsToProducts(data: ApiProducts): Products {
    return {
      timestamp: data.timestamp,
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
}
