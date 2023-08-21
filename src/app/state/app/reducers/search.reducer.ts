import {createFeature, createReducer, on} from '@ngrx/store';
import {SearchActions} from '../actions/search.actions';
import {SearchState} from '../states/search.state';
import {produce} from 'immer';

export const searchFeatureKey = 'search';

export const initialState: SearchState = {
  term: '',
  searchApiLoadingState: 'undefined',
  searchApiResultMatches: [],
  mapMatchesLoadingState: 'undefined',
  mapMatches: [],
  filterGroups: [],
};

export const searchFeature = createFeature({
  name: searchFeatureKey,
  reducer: createReducer(
    initialState,
    on(SearchActions.searchForTerm, (state, {term}): SearchState => {
      return {
        ...state,
        term,
        searchApiResultMatches: initialState.searchApiResultMatches,
        searchApiLoadingState: 'loading',
        mapMatches: initialState.mapMatches,
        mapMatchesLoadingState: 'loading',
      };
    }),
    on(SearchActions.setSearchApiError, (state): SearchState => {
      return {...state, searchApiLoadingState: 'error', searchApiResultMatches: initialState.searchApiResultMatches};
    }),
    on(SearchActions.setSearchApiResults, (state, {results}): SearchState => {
      return {...state, searchApiLoadingState: 'loaded', searchApiResultMatches: results};
    }),
    on(SearchActions.setMapMatchesError, (state): SearchState => {
      return {...state, mapMatchesLoadingState: 'error', mapMatches: initialState.mapMatches};
    }),
    on(SearchActions.setMapMatchesResults, (state, {mapMatches}): SearchState => {
      return {...state, mapMatchesLoadingState: 'loaded', mapMatches};
    }),
    on(SearchActions.clearSearch, (): SearchState => {
      return {...initialState};
    }),
    on(SearchActions.setFilterGroups, (state, {filterGroups}): SearchState => {
      return {...state, filterGroups};
    }),
    on(
      SearchActions.setActiveMapItemsFilterGroup,
      produce((draft, {searchIndexes}) => {
        draft.filterGroups.forEach((filterGroup) => {
          if (filterGroup.useDynamicActiveMapItemsFilter) {
            filterGroup.filters = searchIndexes.map((searchIndex) => {
              const existingFilter = filterGroup.filters.find(
                (filter) => filter.label === searchIndex.displayString && filter.type === searchIndex.indexType,
              );
              return existingFilter
                ? existingFilter
                : {
                    label: searchIndex.displayString,
                    isActive: false,
                    type: searchIndex.indexType,
                  };
            });
          }
        });
      }),
    ),
    on(
      SearchActions.setFilterValue,
      produce((draft, {groupLabel, filterLabel, isActive}) => {
        draft.filterGroups.forEach((filterGroup) => {
          if (filterGroup.label === groupLabel) {
            filterGroup.filters.forEach((filter) => {
              if (filter.label === filterLabel) {
                filter.isActive = isActive;
              }
            });
          }
        });
      }),
    ),
    on(
      SearchActions.resetFilters,
      produce((draft) => {
        draft.filterGroups.flatMap((filterGroup) => filterGroup.filters).forEach((filter) => (filter.isActive = false));
      }),
    ),
  ),
});

export const {
  name,
  reducer,
  selectTerm,
  selectSearchState,
  selectSearchApiLoadingState,
  selectSearchApiResultMatches,
  selectMapMatches,
  selectFilterGroups,
} = searchFeature;
