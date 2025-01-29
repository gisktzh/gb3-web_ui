import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {Observable, of} from 'rxjs';
import {ProductsListData, ProductsRelevantListData} from '../../../models/gb3-api-generated.interfaces';
import {map} from 'rxjs';
import {Product, ProductFormat} from '../../../interfaces/gb3-geoshop-product.interface';
import {DataDownloadFilter} from '../../../interfaces/data-download-filter.interface';
import {ProductAvailability} from '../../../enums/product-availability.enum';

@Injectable({
  providedIn: 'root',
})
export class Gb3GeoshopProductsService extends Gb3ApiService {
  protected readonly endpoint = 'products';

  public loadProducts(): Observable<Product[]> {
    const productsListData = this.get<ProductsListData>(this.getFullEndpointUrl());
    return productsListData.pipe(map((data) => this.mapProductsListDataToProducts(data)));
  }

  public loadRelevanteProducts(guids: string[]): Observable<string[]> {
    if (guids.length === 0) {
      return of([]);
    }
    const productsRelevantListData = this.get<ProductsRelevantListData>(this.createUrlForRelevantProducts(guids));
    return productsRelevantListData.pipe(map((data) => data.products));
  }

  public extractProductFilterValues(products: Product[]): DataDownloadFilter[] {
    const uniqueValues: Map<Pick<DataDownloadFilter, 'category' | 'label'>, Set<string>> = new Map();

    products.forEach((product) => {
      this.configService.filterConfigs.dataDownload.forEach((dataDownloadFilter) => {
        let values: string[];
        switch (dataDownloadFilter.category) {
          case 'availability':
            // special case: it's either ogd or nogd
            values = Object.values(ProductAvailability);
            break;
          case 'format':
            values = product.formats.map((format) => format.description);
            break;
          case 'theme':
            values = product.themes;
            break;
        }
        if (!uniqueValues.has(dataDownloadFilter)) {
          uniqueValues.set(dataDownloadFilter, new Set());
        }
        const valueSet = uniqueValues.get(dataDownloadFilter)!;
        values.forEach((value) => valueSet.add(value));
      });
    });

    const dataDownloadFilters: DataDownloadFilter[] = [];
    uniqueValues.forEach((uniqueValue, category) =>
      dataDownloadFilters.push({
        category: category.category,
        label: category.label,
        filterValues: Array.from(uniqueValue).map((uniqueFilterValue) => ({value: uniqueFilterValue, isActive: false})),
      }),
    );
    return dataDownloadFilters;
  }

  private createUrlForRelevantProducts(guids: string[]): string {
    const url = new URL(`${this.getFullEndpointUrl()}/relevant`);
    url.searchParams.append('topics', guids.join(','));
    return url.toString();
  }

  private mapProductsListDataToProducts(data: ProductsListData): Product[] {
    return data.products.map(
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
    );
  }
}
