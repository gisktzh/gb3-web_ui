import {createFeature, createReducer, on} from '@ngrx/store';
import {QueryModeState} from '../states/query-mode.state';
import {QueryModeActions} from '../actions/query-mode.actions';

export const queryModeFeatureKey = 'queryMode';

export const initialState: QueryModeState = {
  queryMode: 'feature',
};

export const queryModeFeature = createFeature({
  name: queryModeFeatureKey,
  reducer: createReducer(
    initialState,
    on(QueryModeActions.setQueryMode, (state, {queryMode}): QueryModeState => {
      return {...state, queryMode};
    }),
  ),
});

export const {name, reducer, selectQueryModeState, selectQueryMode} = queryModeFeature;
