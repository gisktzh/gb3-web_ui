import {SearchFilterGroup} from '../interfaces/search-filter-group.interface';
import {SearchType} from '../types/search.type';
import {FilterUtils} from './filter.utils';

describe('FilterUtils', () => {
  describe('isSearchFilterActive', () => {
    it.each([
      {mapsActive: false, searchType: 'unknown', expected: true, testType: 'no filter is active'},
      {mapsActive: true, searchType: 'maps', expected: true, testType: 'a given searchType is active'},
      {mapsActive: true, searchType: 'places', expected: false, testType: 'a given searchType is inactive and others are active'},
      {
        mapsActive: true,
        searchType: 'metadata-maps',
        expected: false,
        testType: 'a given searchType cannot be found while filters are active',
      },
    ] as {
      mapsActive: boolean;
      searchType: SearchType;
      expected: boolean;
      testType: string;
    }[])('returns $expected when $testType', ({mapsActive, searchType, expected}) => {
      const filterGroups: SearchFilterGroup[] = [
        {
          filters: [
            {type: 'maps', isActive: mapsActive, label: 'x'},
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

      const actual = FilterUtils.isSearchFilterActive(filterGroups, searchType);
      expect(actual).toBe(expected);
    });
  });
});
