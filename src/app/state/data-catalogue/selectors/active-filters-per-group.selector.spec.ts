import {selectActiveFiltersPerGroup} from './active-filters-per-group.selector';
import {ActiveDataCatalogueFilterGroup, DataCatalogueFilter} from '../../../shared/interfaces/data-catalogue-filter.interface';

describe('selectActiveFiltersPerGroup', () => {
  it('returns an empty list if no filters are available', () => {
    const actual = selectActiveFiltersPerGroup.projector([]);

    expect(actual).toEqual([]);
  });

  it('returns only active filters per group', () => {
    const groupOne: DataCatalogueFilter = {
      key: 'name',
      label: 'Lustige Filter',
      filterValues: [
        {value: 'Filter 1', isActive: true},
        {value: 'Filter 2', isActive: false},
      ],
    };
    const groupTwo: DataCatalogueFilter = {
      key: 'outputFormat',
      label: 'Lustige Filter mit Output',
      filterValues: [
        {value: 'Filter 3', isActive: false},
        {value: 'Filter 4', isActive: true},
      ],
    };

    const actual = selectActiveFiltersPerGroup.projector([groupOne, groupTwo]);

    const expected: ActiveDataCatalogueFilterGroup[] = [
      {key: 'name', values: ['Filter 1']},
      {key: 'outputFormat', values: ['Filter 4']},
    ];
    expect(actual).toEqual(jasmine.arrayWithExactContents(expected));
  });

  it('does not return group if no filters are active', () => {
    const groupOne: DataCatalogueFilter = {
      key: 'name',
      label: 'Lustige Filter',
      filterValues: [
        {value: 'Filter 1', isActive: false},
        {value: 'Filter 2', isActive: false},
      ],
    };
    const groupTwo: DataCatalogueFilter = {
      key: 'outputFormat',
      label: 'Lustige Filter mit Output',
      filterValues: [
        {value: 'Filter 3', isActive: false},
        {value: 'Filter 4', isActive: true},
      ],
    };

    const actual = selectActiveFiltersPerGroup.projector([groupOne, groupTwo]);

    const expected: ActiveDataCatalogueFilterGroup[] = [{key: 'outputFormat', values: ['Filter 4']}];
    expect(actual).toEqual(jasmine.arrayWithExactContents(expected));
  });
});
