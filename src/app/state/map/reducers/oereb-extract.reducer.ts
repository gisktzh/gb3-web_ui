import {createFeature, createReducer, on} from '@ngrx/store';
import {OerebExtractState} from '../states/oereb-extract.state';
import {OerebExtractActions} from '../actions/oereb-extract.actions';

export const oerebExtractFeatureKey = 'oerebExtract';

export const initialState: OerebExtractState = {
  queryLocation: {},
  loadingState: undefined,
  data: null,
};

export const oerebExtractFeature = createFeature({
  name: oerebExtractFeatureKey,
  reducer: createReducer(
    initialState,
    on(OerebExtractActions.sendRequest, (_, {x, y}): OerebExtractState => {
      return {...initialState, queryLocation: {x, y}, loadingState: 'loading'};
    }),
    on(OerebExtractActions.clearContent, (): OerebExtractState => {
      return {...initialState};
    }),
    on(OerebExtractActions.updateContent, (state, {oerebExtract}): OerebExtractState => {
      const data = oerebExtract;
      return {...state, loadingState: 'loaded', data};
    }),
    on(OerebExtractActions.setError, (): OerebExtractState => {
      return {...initialState, loadingState: 'error'};
    }),
  ),
});

export const {name, reducer, selectOerebExtractState, selectQueryLocation, selectLoadingState, selectData} = oerebExtractFeature;
