import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {Observable} from 'rxjs';
import {ProductsListData, ProductsRelevantListData} from '../../../models/gb3-api-generated.interfaces';
import {map} from 'rxjs/operators';
import {Product, ProductFormat, ProductsList} from '../../../interfaces/gb3-geoshop-product.interface';

@Injectable({
  providedIn: 'root',
})
export class Gb3GeoshopProductsService extends Gb3ApiService {
  protected readonly endpoint = 'products';

  public loadProductList(): Observable<ProductsList> {
    const productsListData = this.get<ProductsListData>(this.getFullEndpointUrl());
    return productsListData.pipe(map((data) => this.mapProductsListDataToProductsList(data)));
  }

  public loadRelevanteProducts(guids: string[]): Observable<string[]> {
    const productsRelevantListData = this.get<ProductsRelevantListData>(this.createUrlForTopics(guids));
    return productsRelevantListData.pipe(map((data) => data.products));
  }

  private createUrlForTopics(guids: string[]): string {
    const url = new URL(this.getFullEndpointUrl());
    url.searchParams.append('topics', guids.join(','));
    return url.toString();
  }

  private mapProductsListDataToProductsList(data: ProductsListData): ProductsList {
    return {
      timestamp: data.timestamp,
      products: data.products.map(
        (product): Product => ({
          id: product.id,
          name: product.name,
          gisZHNr: product.giszhnr,
          ogd: product.ogd,
          nonOgdProductUrl: product.url ?? undefined,
          themes: product.themes ?? [],
          keywords: product.keywords ?? [],
          geolionGeodatensatzUuid: product.geolion_geodatensatz_uuid ?? undefined,
          formats: product.formats.map((format): ProductFormat => ({id: format.id, description: format.description})),
        }),
      ),
    };
  }
}
