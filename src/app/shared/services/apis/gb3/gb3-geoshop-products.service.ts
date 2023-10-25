import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {Observable} from 'rxjs';
import {ProductsListData} from '../../../models/gb3-api-generated.interfaces';
import {map} from 'rxjs/operators';
import {Municipality, Product, ProductFormat, ProductsList} from '../../../interfaces/gb3-geoshop-product.interface';
import {ApiGeojsonGeometryToGb3ConverterUtils} from '../../../utils/api-geojson-geometry-to-gb3-converter.utils';

@Injectable({
  providedIn: 'root',
})
export class Gb3GeoshopProductsService extends Gb3ApiService {
  protected readonly endpoint = 'products';

  public loadGeoshopProductList(guids?: string[]): Observable<ProductsList> {
    const productsListData = this.get<ProductsListData>(this.createUrlForTopics(guids));
    return productsListData.pipe(map((data) => this.mapProductsListDataToProductsList(data)));
  }

  private createUrlForTopics(guids?: string[]): string {
    const url = new URL(this.getFullEndpointUrl());
    if (guids) {
      url.searchParams.append('topics', guids.join(','));
    }
    return url.toString();
  }

  private mapProductsListDataToProductsList(data: ProductsListData): ProductsList {
    return {
      timestamp: data.timestamp,
      products: data.products.map((product): Product => ({
        id: product.id,
        name: product.name,
        giszhnr: product.giszhnr,
        description: product.description,
        ogd: product.ogd,
        nonOgdProductUrl: product.url,
        themes: product.themes,
        type: product.type,
        keywords: product.keywords,
        formats: product.formats.map((format): ProductFormat => ({id: format.id, description: format.description})),
      })),
      municipalities: data.municipalities.map((municipality): Municipality => ({
        name: municipality.name,
        bfsNo: municipality.bfs_no,
        boundingbox: ApiGeojsonGeometryToGb3ConverterUtils.convert(municipality.boundingbox),
      })),
    };
  }
}
