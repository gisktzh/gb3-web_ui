import {createSelector} from '@ngrx/store';
import {selectProductsList, selectRelevantProductIds} from '../reducers/data-download-product.reducer';
import {Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';

export const selectRelevantProducts = createSelector(
  selectProductsList,
  selectRelevantProductIds,
  (productList, relevantProductIds): Product[] => {
    if (!productList) {
      return [];
    }
    return relevantProductIds
      .map((relevantProductId) => productList.products.find((product) => product.id === relevantProductId))
      .filter((relevantProduct): relevantProduct is Product => !!relevantProduct);
  },
);
