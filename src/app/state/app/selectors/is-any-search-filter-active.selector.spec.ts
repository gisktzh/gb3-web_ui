import {SearchFilterGroup} from '../../../shared/interfaces/search-filter-group.interface';
import {selectIsAnySearchFilterActiveSelector} from './is-any-search-filter-active.selector';

describe('selectIsAnySearchFilterActiveSelector', () => {
  it('returns true if any filters are active', () => {
    const searchFilterGroups: SearchFilterGroup[] = [
      {
        label: 'Group1',
        useDynamicActiveMapItemsFilter: false,
        filters: [
          {label: 'Filter1-addresses Label', isActive: false, type: 'addresses'},
          {label: 'Filter2-places Label', isActive: true, type: 'places'},
          {label: 'Filter3-maps Label', isActive: false, type: 'maps'},
        ],
      },
      {label: 'Group2', useDynamicActiveMapItemsFilter: true, filters: []},
    ];
    const actual = selectIsAnySearchFilterActiveSelector.projector(searchFilterGroups);
    const expected = true;

    expect(actual).toBe(expected);
  });

  it('returns false if no filters are active', () => {
    const searchFilterGroups: SearchFilterGroup[] = [
      {
        label: 'Group1',
        useDynamicActiveMapItemsFilter: false,
        filters: [
          {label: 'Filter1-addresses Label', isActive: false, type: 'addresses'},
          {label: 'Filter2-places Label', isActive: false, type: 'places'},
          {label: 'Filter3-maps Label', isActive: false, type: 'maps'},
        ],
      },
      {label: 'Group2', useDynamicActiveMapItemsFilter: true, filters: []},
    ];
    const actual = selectIsAnySearchFilterActiveSelector.projector(searchFilterGroups);
    const expected = false;

    expect(actual).toBe(expected);
  });

  it('returns false if no filter groups are given', () => {
    const searchFilterGroups: SearchFilterGroup[] = [];
    const actual = selectIsAnySearchFilterActiveSelector.projector(searchFilterGroups);
    const expected = false;

    expect(actual).toBe(expected);
  });
});
