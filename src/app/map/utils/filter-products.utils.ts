import {Product} from '../../shared/interfaces/gb3-geoshop-product.interface';
import {ProductAvailability} from '../../shared/enums/product-availability.enum';
import {ActiveDataDownloadFilterGroup} from '../../shared/interfaces/data-download-filter.interface';

export class FilterProductsUtils {
  public static filterProducts(
    products: Product[],
    activeFilters: ActiveDataDownloadFilterGroup[],
    filterTerm: string | undefined,
  ): Product[] {
    if (activeFilters.length === 0 && (filterTerm === undefined || filterTerm === '')) {
      return products;
    }

    const lowerCaseFilterTerm = filterTerm?.toLowerCase();
    return products
      .filter((product) => {
        return activeFilters.every((activeFilter) => {
          if (activeFilter.values.length === 0) {
            // no filter active is equivalent to every filter active => no filtering
            return true;
          }
          switch (activeFilter.category) {
            case 'availability':
              return product.ogd
                ? activeFilter.values.includes(ProductAvailability.Ogd)
                : activeFilter.values.includes(ProductAvailability.Nogd);
            case 'format':
              return product.formats.some((format) => activeFilter.values.includes(format.description));
            case 'theme':
              return product.themes.some((theme) => activeFilter.values.includes(theme));
          }
        });
      })
      .filter(
        (product) =>
          lowerCaseFilterTerm === undefined ||
          lowerCaseFilterTerm === '' ||
          product.name.toLowerCase().includes(lowerCaseFilterTerm) ||
          product.keywords.some((keyword) => keyword.toLowerCase().includes(lowerCaseFilterTerm)),
      );
  }
}
