import {createSelector} from '@ngrx/store';
import {selectFilterTerm, selectProducts, selectRelevantProductIds} from '../reducers/data-download-product.reducer';
import {selectActiveDataDownloadFiltersPerCategory} from './active-data-download-filters-per-category.selector';
import {Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {FilterProductsUtils} from '../../../map/utils/filter-products.utils';

export const selectFilteredProducts = createSelector(
  selectProducts,
  selectActiveDataDownloadFiltersPerCategory,
  selectFilterTerm,
  selectRelevantProductIds,
  (products, activeFilters, filterTerm, relevantProductIds): Product[] => {
    return FilterProductsUtils.filterProducts(products, activeFilters, filterTerm).filter(
      (product) => !relevantProductIds.includes(product.id),
    );
  },
);
