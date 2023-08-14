import {createFeature, createReducer, on} from '@ngrx/store';
import {SearchActions} from '../actions/search.actions';
import {SearchState} from '../states/search.state';

export const searchFeatureKey = 'search';

export const initialState: SearchState = {
  term: '',
  indexes: [],
  searchServiceLoadingState: 'undefined',
  searchServiceResults: [],
  filteredMapsLoadingState: 'undefined',
  filteredMaps: [],
};

export const searchFeature = createFeature({
  name: searchFeatureKey,
  reducer: createReducer(
    initialState,
    on(SearchActions.searchTermAndIndexes, (state, {term, indexes}): SearchState => {
      return {...initialState, term, indexes, searchServiceLoadingState: 'loading', filteredMapsLoadingState: 'loading'};
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
    on(SearchActions.clear, (): SearchState => {
      return {...initialState};
    }),
  ),
});

export const {name, reducer, selectTerm, selectSearchState} = searchFeature;
