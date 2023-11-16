import {createSelector} from '@ngrx/store';
import {selectFilterTerm, selectProducts, selectRelevantProductIds} from '../reducers/data-download-product.reducer';
import {Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {selectActiveDataDownloadFiltersPerCategory} from './active-data-download-filters-per-category.selector';
import {FilterProductsUtils} from '../../../map/utils/filter-products.utils';

export const selectRelevantProducts = createSelector(
  selectProducts,
  selectRelevantProductIds,
  selectActiveDataDownloadFiltersPerCategory,
  selectFilterTerm,
  (products, relevantProductIds, activeFilters, filterTerm): Product[] => {
    const relevantProducts = relevantProductIds
      .map((relevantProductId) => products.find((product) => product.id === relevantProductId))
      .filter((relevantProduct): relevantProduct is Product => !!relevantProduct);
    return FilterProductsUtils.filterProducts(relevantProducts, activeFilters, filterTerm);
  },
);
