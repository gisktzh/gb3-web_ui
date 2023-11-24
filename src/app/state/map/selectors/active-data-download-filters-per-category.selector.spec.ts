import {ActiveDataDownloadFilterGroup, DataDownloadFilter} from '../../../shared/interfaces/data-download-filter.interface';
import {selectActiveDataDownloadFiltersPerCategory} from './active-data-download-filters-per-category.selector';

describe('selectActiveDataDownloadFiltersPerCategory', () => {
  it('returns only active filter values grouped by category', () => {
    const selectFilterMock: DataDownloadFilter[] = [
      {
        category: 'theme',
        filterValues: [
          {value: 'activeFilter', isActive: true},
          {value: 'inactiveFilter', isActive: false},
        ],
        label: 'themeLabel',
      },
      {
        category: 'format',
        filterValues: [
          {value: 'firstActiveFilter', isActive: true},
          {value: 'secondActiveFilter', isActive: true},
        ],
        label: 'formatLabel',
      },
      {
        category: 'availability',
        filterValues: [
          {value: 'firstInactiveFilter', isActive: false},
          {value: 'secondInactiveFilter', isActive: false},
        ],
        label: 'availabilityLabel',
      },
    ];

    const actual = selectActiveDataDownloadFiltersPerCategory.projector(selectFilterMock);
    const expected: ActiveDataDownloadFilterGroup[] = [
      {category: 'theme', values: ['activeFilter']},
      {category: 'format', values: ['firstActiveFilter', 'secondActiveFilter']},
    ];

    expect(actual).toEqual(expected);
  });
});
