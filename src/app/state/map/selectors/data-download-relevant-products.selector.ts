import {createSelector} from '@ngrx/store';
import {selectProducts, selectRelevantProductIds} from '../reducers/data-download-product.reducer';
import {Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';

export const selectRelevantProducts = createSelector(
  selectProducts,
  selectRelevantProductIds,
  (products, relevantProductIds): Product[] => {
    return relevantProductIds
      .map((relevantProductId) => products.find((product) => product.id === relevantProductId))
      .filter((relevantProduct): relevantProduct is Product => !!relevantProduct);
  },
);
