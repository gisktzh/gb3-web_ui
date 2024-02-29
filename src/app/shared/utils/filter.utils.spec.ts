import {SearchFilterGroup} from '../interfaces/search-filter-group.interface';
import {FilterUtils} from './filter.utils';

describe('FilterUtils', () => {
  describe('isSearchFilterActive', () => {
    it('returns true if no filter is active', () => {
      const filterGroups: SearchFilterGroup[] = [
        {
          filters: [
            {type: 'maps', isActive: false, label: 'x'},
            {type: 'faqs', isActive: false, label: 'x'},
            {type: 'usefulLinks', isActive: false, label: 'x'},
          ],
          label: 'x',
          useDynamicActiveMapItemsFilter: true,
        },
        {
          filters: [{type: 'places', isActive: false, label: 'x'}],
          label: 'xx',
          useDynamicActiveMapItemsFilter: true,
        },
      ];

      const actual = FilterUtils.isSearchFilterActive(filterGroups, 'unknown');
      expect(actual).toBeTrue();
    });

    it('returns true if a given searchType is active', () => {
      const filterGroups: SearchFilterGroup[] = [
        {
          filters: [
            {type: 'maps', isActive: true, label: 'x'},
            {type: 'faqs', isActive: false, label: 'x'},
            {type: 'usefulLinks', isActive: false, label: 'x'},
          ],
          label: 'x',
          useDynamicActiveMapItemsFilter: true,
        },
        {
          filters: [{type: 'places', isActive: false, label: 'x'}],
          label: 'xx',
          useDynamicActiveMapItemsFilter: true,
        },
      ];

      const actual = FilterUtils.isSearchFilterActive(filterGroups, 'maps');
      expect(actual).toBeTrue();
    });

    it('returns false if a given searchType is inactive and others are active', () => {
      const filterGroups: SearchFilterGroup[] = [
        {
          filters: [
            {type: 'maps', isActive: true, label: 'x'},
            {type: 'faqs', isActive: false, label: 'x'},
            {type: 'usefulLinks', isActive: false, label: 'x'},
          ],
          label: 'x',
          useDynamicActiveMapItemsFilter: true,
        },
        {
          filters: [{type: 'places', isActive: false, label: 'x'}],
          label: 'xx',
          useDynamicActiveMapItemsFilter: true,
        },
      ];

      const actual = FilterUtils.isSearchFilterActive(filterGroups, 'places');
      expect(actual).toBeFalse();
    });

    it('returns false if a given searchType cannot be found while filters are active', () => {
      const filterGroups: SearchFilterGroup[] = [
        {
          filters: [
            {type: 'maps', isActive: true, label: 'x'},
            {type: 'faqs', isActive: false, label: 'x'},
            {type: 'usefulLinks', isActive: false, label: 'x'},
          ],
          label: 'x',
          useDynamicActiveMapItemsFilter: true,
        },
        {
          filters: [{type: 'places', isActive: false, label: 'x'}],
          label: 'xx',
          useDynamicActiveMapItemsFilter: true,
        },
      ];

      const actual = FilterUtils.isSearchFilterActive(filterGroups, 'metadata-maps');
      expect(actual).toBeFalse();
    });
  });
});
