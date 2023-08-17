import {createFeature, createReducer, on} from '@ngrx/store';
import {SearchActions} from '../actions/search.actions';
import {SearchState} from '../states/search.state';
import {produce} from 'immer';

export const searchFeatureKey = 'search';

export const initialState: SearchState = {
  term: '',
  searchServiceLoadingState: 'undefined',
  searchServiceResults: [],
  filteredMapsLoadingState: 'undefined',
  filteredMaps: [],
  filterGroups: [],
};

export const searchFeature = createFeature({
  name: searchFeatureKey,
  reducer: createReducer(
    initialState,
    on(SearchActions.searchForTerm, (state, {term}): SearchState => {
      return {...state, term, searchServiceLoadingState: 'loading', filteredMapsLoadingState: 'loading'};
    }),
    on(SearchActions.setSearchServiceError, (state): SearchState => {
      return {...state, searchServiceLoadingState: 'error', searchServiceResults: initialState.searchServiceResults};
    }),
    on(SearchActions.setSearchServiceResults, (state, {results}): SearchState => {
      return {...state, searchServiceLoadingState: 'loaded', searchServiceResults: results};
    }),
    on(SearchActions.setFilteredMapsError, (state): SearchState => {
      return {...state, filteredMapsLoadingState: 'error', filteredMaps: initialState.filteredMaps};
    }),
    on(SearchActions.setFilteredMapsResults, (state, {filteredMaps}): SearchState => {
      return {...state, filteredMapsLoadingState: 'loaded', filteredMaps};
    }),
    on(SearchActions.clearSearch, (): SearchState => {
      return {...initialState};
    }),
    on(SearchActions.setFilterGroups, (state, {filterGroups}): SearchState => {
      return {...state, filterGroups};
    }),
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

export const {name, reducer, selectTerm, selectSearchState, selectSearchServiceResults, selectFilteredMaps, selectFilterGroups} =
  searchFeature;
