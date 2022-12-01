import {createFeature, createReducer, on} from '@ngrx/store';
import {InfoQueryActions} from '../actions/info-query.actions';

export const infoQueryFeatureKey = 'infoQuery';

export interface InfoQueryState {
  loadingState: 'loading' | 'loaded' | undefined;
}

export const initialState: InfoQueryState = {
  loadingState: undefined
};

export const infoQueryFeature = createFeature({
  name: infoQueryFeatureKey,
  reducer: createReducer(
    initialState,
    on(InfoQueryActions.sendRequest, (state, {location}): InfoQueryState => {
      return {...state, loadingState: 'loading'};
    })
  )
});

export const {name, reducer, selectInfoQueryState} = infoQueryFeature;
