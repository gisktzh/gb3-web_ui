import {selectFilteredProducts} from './filtered-products.selector';
import {Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';

describe('selectFilteredProducts', () => {
  // this test ignores the filter capabilities from `FilterProductsUtils.filterProducts()` as it is already tested in another unit test
  it('returns all products that are not in the relevant product ids list', () => {
    const selectProductsMock: Product[] = [
      {id: '0'} as Product,
      {id: '1'} as Product,
      {id: '2'} as Product,
      {id: '3'} as Product,
      {id: '4'} as Product,
      {id: '5'} as Product,
    ];
    const selectRelevantProductIdsMock: string[] = ['1', '3'];

    const actual = selectFilteredProducts.projector(selectProductsMock, [], undefined, selectRelevantProductIdsMock);
    const expected: Product[] = [selectProductsMock[0], selectProductsMock[2], selectProductsMock[4], selectProductsMock[5]];

    expect(actual).toEqual(expected);
  });
});
