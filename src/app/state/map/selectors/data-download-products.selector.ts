import {createSelector} from '@ngrx/store';
import {selectFilterTerm, selectProducts, selectRelevantProductIds} from '../reducers/data-download-product.reducer';
import {selectActiveDataDownloadFiltersPerCategory} from './active-data-download-filters-per-category.selector';
import {Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {ProductAvailability} from '../../../shared/enums/product-availability.enum';

export const selectDataDownloadProducts = createSelector(
  selectProducts,
  selectActiveDataDownloadFiltersPerCategory,
  selectFilterTerm,
  selectRelevantProductIds,
  (products, activeFilters, filterTerm, relevantProductIds): Product[] => {
    if (activeFilters.length === 0 && filterTerm === '') {
      return products;
    }

    const lowerCaseFilterTerm = filterTerm?.toLowerCase();
    return products
      .filter((product) => !relevantProductIds.includes(product.id))
      .filter((product) => {
        return activeFilters.every((activeFilter) => {
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
  },
);
