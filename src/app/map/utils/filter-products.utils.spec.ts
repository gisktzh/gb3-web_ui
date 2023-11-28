import {Product} from '../../shared/interfaces/gb3-geoshop-product.interface';
import {FilterProductsUtils} from './filter-products.utils';
import {ActiveDataDownloadFilterGroup} from '../../shared/interfaces/data-download-filter.interface';
import {ProductAvailability} from '../../shared/enums/product-availability.enum';

describe('FilterProductsUtils', () => {
  const products: Product[] = [
    {
      id: '112',
      ogd: true,
      themes: ['Elements', 'Bender', 'Male'],
      gisZHNr: 1337,
      keywords: ['Avatar', 'Master of four elements', 'Airbender'],
      nonOgdProductUrl: undefined,
      geolionGeodatensatzUuid: 'abcd-efgh-ijkl-mnop',
      name: 'Aang',
      formats: [
        {
          id: 1,
          description: 'Water (.nas)',
        },
        {
          id: 2,
          description: 'Earth (.erd)',
        },
        {
          id: 3,
          description: 'Fire (.hot)',
        },
        {
          id: 4,
          description: 'Air (.air)',
        },
      ],
    },
    {
      id: '14',
      ogd: false,
      themes: ['Elements', 'Bender', 'Female'],
      gisZHNr: 1337,
      keywords: ['Waterbender'],
      nonOgdProductUrl: 'www.example.com',
      geolionGeodatensatzUuid: 'abcd-efgh-ijkl-mnop',
      name: 'Katara',
      formats: [
        {
          id: 1,
          description: 'Water (.nas)',
        },
      ],
    },
    {
      id: '16',
      ogd: false,
      themes: ['Elements', 'Bender', 'Male', 'Honor'],
      gisZHNr: 1337,
      keywords: ['Firebender', 'Prince'],
      nonOgdProductUrl: 'www.example.com',
      geolionGeodatensatzUuid: 'abcd-efgh-ijkl-mnop',
      name: 'Zuko',
      formats: [
        {
          id: 3,
          description: 'Only Fire (.hot)',
        },
      ],
    },
  ];

  it('returns all products if the active filters are empty and the filter term is undefined', () => {
    const actual = FilterProductsUtils.filterProducts(products, [], undefined);

    const expected: Product[] = products;

    expect(actual).toEqual(expected);
  });

  it('returns all products if the active filters are empty and the filter term is empty', () => {
    const actual = FilterProductsUtils.filterProducts(products, [], '');

    const expected: Product[] = products;

    expect(actual).toEqual(expected);
  });

  it('returns products where the filter term is partially matching the name', () => {
    const filterTerm = 'kAtA';
    const actual = FilterProductsUtils.filterProducts(products, [], filterTerm);

    const expected: Product[] = [products[1]];

    expect(actual).toEqual(expected);
  });

  it('returns products where the filter term is partially matching a keyword', () => {
    const filterTerm = 'waTEr';
    const actual = FilterProductsUtils.filterProducts(products, [], filterTerm);

    const expected: Product[] = [products[1]];

    expect(actual).toEqual(expected);
  });

  it('returns no product if the filter term is not matching anything', () => {
    const filterTerm = 'nothiNG';
    const actual = FilterProductsUtils.filterProducts(products, [], filterTerm);

    const expected: Product[] = [];

    expect(actual).toEqual(expected);
  });

  it('returns products where the theme filters are matching', () => {
    const activeFilters: ActiveDataDownloadFilterGroup[] = [{category: 'theme', values: ['Male']}];
    const actual = FilterProductsUtils.filterProducts(products, activeFilters, undefined);

    const expected: Product[] = [products[0], products[2]];

    expect(actual).toEqual(expected);
  });

  it('returns products where the format filters are matching', () => {
    const activeFilters: ActiveDataDownloadFilterGroup[] = [{category: 'format', values: ['Water (.nas)']}];
    const actual = FilterProductsUtils.filterProducts(products, activeFilters, undefined);

    const expected: Product[] = [products[0], products[1]];

    expect(actual).toEqual(expected);
  });

  it('returns products where the availability filters are matching', () => {
    const activeFilters: ActiveDataDownloadFilterGroup[] = [{category: 'availability', values: [ProductAvailability.Ogd]}];
    const actual = FilterProductsUtils.filterProducts(products, activeFilters, undefined);

    const expected: Product[] = [products[0]];

    expect(actual).toEqual(expected);
  });

  it('returns all products if all active filters for a category are active', () => {
    const activeFilters: ActiveDataDownloadFilterGroup[] = [
      {category: 'availability', values: [ProductAvailability.Ogd, ProductAvailability.Nogd]},
    ];
    const actual = FilterProductsUtils.filterProducts(products, activeFilters, undefined);

    const expected: Product[] = products;

    expect(actual).toEqual(expected);
  });

  it('returns all products if all active filters for a category are empty', () => {
    const activeFilters: ActiveDataDownloadFilterGroup[] = [{category: 'availability', values: []}];
    const actual = FilterProductsUtils.filterProducts(products, activeFilters, undefined);

    const expected: Product[] = products;

    expect(actual).toEqual(expected);
  });

  it('returns no product if the active filters are not matching anything', () => {
    const activeFilters: ActiveDataDownloadFilterGroup[] = [
      {category: 'theme', values: ['nOTHING']},
      {category: 'format', values: ['oneNothing', 'twoNothing']},
      {category: 'availability', values: ['rägebogeNothing']},
    ];
    const actual = FilterProductsUtils.filterProducts(products, activeFilters, undefined);

    const expected: Product[] = [];

    expect(actual).toEqual(expected);
  });
});
