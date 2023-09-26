import {initialState, reducer} from './search.reducer';
import {SearchState} from '../states/search.state';
import {SearchFilterGroup} from '../../../shared/interfaces/search-filter-group.interface';
import {SearchApiResultMatch} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {SearchActions} from '../actions/search.actions';
import {SearchOptions} from '../../../shared/interfaces/search-config.interface';

describe('search Reducer', () => {
  const searchOptionsMock: SearchOptions = {
    faq: true,
    maps: true,
    searchIndexTypes: ['addresses'],
  };

  const filterGroupsMock: SearchFilterGroup[] = [
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

  const searchMatchesMock: SearchApiResultMatch[] = [
    {
      indexType: 'places',
      indexName: 'Place',
      displayString: 'Places One Match',
      geometry: {srs: 2056, type: 'Point', coordinates: [0, 0]},
      score: 1337,
    },
    {
      indexType: 'addresses',
      indexName: 'Address',
      displayString: 'Address One Match',
      geometry: {srs: 2056, type: 'Point', coordinates: [1, 1]},
      score: 42,
    },
    {
      indexType: 'activeMapItems',
      indexName: 'Index One',
      displayString: 'Index One Match',
      geometry: {srs: 2056, type: 'Point', coordinates: [2, 2]},
      score: 9001,
    },
    {
      indexType: 'activeMapItems',
      indexName: 'Index Two',
      displayString: 'Index Two Match',
      geometry: {srs: 2056, type: 'Point', coordinates: [3, 3]},
      score: 666,
    },
  ];

  const errorMock: Error = new Error('oh no! anyway...');
  let existingState: SearchState;

  beforeEach(() => {
    existingState = {
      filterGroups: filterGroupsMock,
      searchApiLoadingState: 'loaded',
      searchApiResultMatches: searchMatchesMock,
      term: 'search term',
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('searchForTerm', () => {
    it('sets the search term and the loading state to `loading` and resets results', () => {
      const searchTerm = 'test term';
      const action = SearchActions.searchForTerm({term: searchTerm, options: searchOptionsMock});
      const state = reducer(existingState, action);

      expect(state.filterGroups).toEqual(filterGroupsMock);
      expect(state.searchApiLoadingState).toBe('loading');
      expect(state.searchApiResultMatches).toEqual(initialState.searchApiResultMatches);
      expect(state.term).toBe(searchTerm);
    });
  });

  describe('setSearchApiError', () => {
    it('sets the loading state to `error` on failure and resets the results', () => {
      const action = SearchActions.setSearchApiError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.filterGroups).toEqual(existingState.filterGroups);
      expect(state.searchApiLoadingState).toBe('error');
      expect(state.searchApiResultMatches).toEqual(initialState.searchApiResultMatches);
      expect(state.term).toBe(existingState.term);
    });
  });

  describe('setSearchApiResults', () => {
    it('sets the loading state to `loaded` on success and sets the results', () => {
      existingState.searchApiLoadingState = 'loading';
      existingState.searchApiResultMatches = [];
      const action = SearchActions.setSearchApiResults({results: searchMatchesMock});
      const state = reducer(existingState, action);

      expect(state.filterGroups).toEqual(filterGroupsMock);
      expect(state.searchApiLoadingState).toBe('loaded');
      expect(state.searchApiResultMatches).toEqual(searchMatchesMock);
      expect(state.term).toBe(existingState.term);
    });
  });

  describe('clearSearchTerm', () => {
    it('clears the search term and resets the results', () => {
      const action = SearchActions.clearSearchTerm();
      const state = reducer(existingState, action);

      expect(state.filterGroups).toEqual(filterGroupsMock);
      expect(state.searchApiLoadingState).toBe(initialState.searchApiLoadingState);
      expect(state.searchApiResultMatches).toEqual(initialState.searchApiResultMatches);
      expect(state.term).toBe(initialState.term);
    });
  });

  describe('setFilterGroups', () => {
    it('sets the filter groups', () => {
      const filterGroups: SearchFilterGroup[] = [
        {
          label: 'new group',
          useDynamicActiveMapItemsFilter: true,
          filters: [{label: 'new filter', isActive: false, type: 'metadata-datasets'}],
        },
      ];
      const action = SearchActions.setFilterGroups({filterGroups});
      const state = reducer(existingState, action);

      expect(state.filterGroups).toEqual(filterGroups);
      expect(state.searchApiLoadingState).toBe(existingState.searchApiLoadingState);
      expect(state.searchApiResultMatches).toEqual(existingState.searchApiResultMatches);
      expect(state.term).toBe(existingState.term);
    });
  });

  describe('setFilterValue', () => {
    it('sets the filter value without changing anything else', () => {
      const filterValue = {groupLabel: 'Group1', filterLabel: 'Filter1-addresses Label', isActive: true};
      const action = SearchActions.setFilterValue(filterValue);
      const state = reducer(existingState, action);

      expect(state.filterGroups).not.toEqual(existingState.filterGroups);
      state.filterGroups.forEach((currentGroup) => {
        const previousGroup = existingState.filterGroups.find((group) => group.label === currentGroup.label);
        expect(previousGroup).toBeDefined();
        currentGroup.filters.forEach((currentFilter) => {
          const previousFilter = previousGroup!.filters.find((filter) => filter.label === currentFilter.label);
          expect(previousFilter).toBeDefined();
          if (currentGroup.label === filterValue.groupLabel && currentFilter.label === filterValue.filterLabel) {
            expect(currentFilter.isActive).not.toBe(previousFilter!.isActive);
          } else {
            expect(currentFilter).toEqual(previousFilter!);
          }
        });
      });
      expect(state.searchApiLoadingState).toBe(existingState.searchApiLoadingState);
      expect(state.searchApiResultMatches).toEqual(existingState.searchApiResultMatches);
      expect(state.term).toBe(existingState.term);
    });
  });

  describe('resetFilters', () => {
    it('sets all existing filter to inactive', () => {
      const action = SearchActions.resetFilters();
      const state = reducer(existingState, action);

      expect(state.filterGroups).not.toEqual(existingState.filterGroups);
      state.filterGroups
        .flatMap((group) => group.filters)
        .forEach((filter) => {
          expect(filter.isActive).toBeFalse();
        });
      expect(state.searchApiLoadingState).toBe(existingState.searchApiLoadingState);
      expect(state.searchApiResultMatches).toEqual(existingState.searchApiResultMatches);
      expect(state.term).toBe(existingState.term);
    });
  });

  describe('resetSearchAndFilters', () => {
    it('sets the whole state to its initial state', () => {
      const action = SearchActions.resetSearchAndFilters();
      const state = reducer(existingState, action);

      expect(state.filterGroups).toEqual(initialState.filterGroups);
      expect(state.searchApiLoadingState).toBe(initialState.searchApiLoadingState);
      expect(state.searchApiResultMatches).toEqual(initialState.searchApiResultMatches);
      expect(state.term).toBe(initialState.term);
    });
  });
});
