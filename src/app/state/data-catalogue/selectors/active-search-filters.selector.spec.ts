import {selectActiveSearchFilterValues} from './active-search-filters.selector';
import {SearchFilterGroup} from '../../../shared/interfaces/search-filter-group.interface';

describe('selectActiveSearchFilterValues', () => {
  it('returns an empty list if no filters are available', () => {
    const actual = selectActiveSearchFilterValues.projector([]);

    expect(actual).toEqual([]);
  });

  it('returns an empty list if no filters are active', () => {
    const filterGroupsMock: SearchFilterGroup[] = [
      {
        label: 'test',
        useDynamicActiveMapItemsFilter: false,
        filters: [
          {label: 'filter1', isActive: false, type: 'maps'},
          {label: 'filter2', isActive: false, type: 'metadata-maps'},
        ],
      },
    ];
    const actual = selectActiveSearchFilterValues.projector(filterGroupsMock);

    expect(actual).toEqual([]);
  });

  it('returns an flat list of all active filters', () => {
    const filterGroupsMock: SearchFilterGroup[] = [
      {
        label: 'group1',
        useDynamicActiveMapItemsFilter: false,
        filters: [
          {label: 'filter1', isActive: true, type: 'maps'},
          {label: 'filter2', isActive: false, type: 'metadata-maps'},
        ],
      },
      {
        label: 'group2',
        useDynamicActiveMapItemsFilter: true,
        filters: [
          {label: 'filter3', isActive: false, type: 'faqs'},
          {label: 'filter4', isActive: true, type: 'metadata-products'},
        ],
      },
    ];
    const actual = selectActiveSearchFilterValues.projector(filterGroupsMock);
    const expected = [
      {groupLabel: 'group1', filterLabel: 'filter1'},
      {groupLabel: 'group2', filterLabel: 'filter4'},
    ];

    expect(actual).toEqual(jasmine.arrayWithExactContents(expected));
  });
});
