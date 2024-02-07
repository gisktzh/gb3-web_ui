import {createFeature, createReducer, on} from '@ngrx/store';
import {SearchActions} from '../actions/search.actions';
import {SearchState} from '../states/search.state';
import {produce} from 'immer';

export const searchFeatureKey = 'search';

export const initialState: SearchState = {
  term: '',
  searchApiLoadingState: undefined,
  searchApiResultMatches: [],
  filterGroups: [],
  selectedSearchResult: undefined,
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
        selectedSearchResult: initialState.selectedSearchResult,
      };
    }),
    on(SearchActions.setSearchApiError, (state): SearchState => {
      return {...state, searchApiLoadingState: 'error', searchApiResultMatches: initialState.searchApiResultMatches};
    }),
    on(SearchActions.setSearchApiResults, (state, {results}): SearchState => {
      return {...state, searchApiLoadingState: 'loaded', searchApiResultMatches: results};
    }),
    on(SearchActions.clearSearchTerm, (state): SearchState => {
      return {
        ...state,
        term: initialState.term,
        searchApiLoadingState: initialState.searchApiLoadingState,
        searchApiResultMatches: initialState.searchApiResultMatches,
        selectedSearchResult: initialState.selectedSearchResult,
      };
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
                (filter) => filter.label === searchIndex.label && filter.type === searchIndex.indexType,
              );
              return (
                existingFilter ?? {
                  label: searchIndex.label,
                  isActive: false,
                  type: searchIndex.indexType,
                }
              );
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
    on(SearchActions.resetSearchAndFilters, (): SearchState => {
      return {...initialState};
    }),
    on(SearchActions.selectSearchResult, (state, {searchResult}): SearchState => {
      return {...state, selectedSearchResult: searchResult};
    }),
  ),
});

export const {
  name,
  reducer,
  selectTerm,
  selectSearchState,
  selectSearchApiLoadingState,
  selectSearchApiResultMatches,
  selectFilterGroups,
  selectSelectedSearchResult,
} = searchFeature;
