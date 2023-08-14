import {selectActiveFilterValues} from './active-filter-values.selector';
import {ActiveDataCatalogueFilterGroup} from '../../../shared/interfaces/data-catalogue-filter.interface';

describe('selectActiveFilterValues', () => {
  it('returns an empty list if no filters are active', () => {
    const actual = selectActiveFilterValues.projector([]);

    expect(actual).toEqual([]);
  });
  it('returns an flat list of active filter values', () => {
    const groupOne: ActiveDataCatalogueFilterGroup = {
      key: 'type',
      values: ['test-1', 'test-2'],
    };
    const groupTwo: ActiveDataCatalogueFilterGroup = {
      key: 'name',
      values: ['test-3', 'test-4'],
    };

    const actual = selectActiveFilterValues.projector([groupOne, groupTwo]);

    const expected = [
      {key: 'type', value: 'test-1'},
      {key: 'type', value: 'test-2'},
      {key: 'name', value: 'test-3'},
      {key: 'name', value: 'test-4'},
    ];
    expect(actual).toEqual(jasmine.arrayWithExactContents(expected));
  });
});
