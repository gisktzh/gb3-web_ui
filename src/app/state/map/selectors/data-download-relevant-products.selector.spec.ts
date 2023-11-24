import {Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {selectRelevantProducts} from './data-download-relevant-products.selector';

describe('selectRelevantProducts', () => {
  // this test ignores the filter capabilities from `FilterProductsUtils.filterProducts()` as it is already tested in another unit test
  it('returns all existing products that have the same ID as the relevant products', () => {
    const selectProductsMock: Product[] = [
      {id: '0'} as Product,
      {id: '1'} as Product,
      {id: '2'} as Product,
      {id: '3'} as Product,
      {id: '4'} as Product,
      {id: '5'} as Product,
    ];
    const selectRelevantProductIdsMock: string[] = ['1', '3', '7'];

    const actual = selectRelevantProducts.projector(selectProductsMock, selectRelevantProductIdsMock, [], undefined);
    const expected: Product[] = [selectProductsMock[1], selectProductsMock[3]];

    expect(actual).toEqual(expected);
  });
});
