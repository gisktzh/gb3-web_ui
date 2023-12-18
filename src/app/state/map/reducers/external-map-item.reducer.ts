import {createFeature, createReducer, on} from '@ngrx/store';
import {ExternalMapItemActions} from '../actions/external-map-item.actions';
import {ExternalMapItemState} from '../states/external-map-item.state';

export const externalMapItemFeatureKey = 'externalMapItem';

export const initialState: ExternalMapItemState = {
  loadingState: undefined,
};

export const externalMapItemFeature = createFeature({
  name: externalMapItemFeatureKey,
  reducer: createReducer(
    initialState,
    on(ExternalMapItemActions.loadItem, (): ExternalMapItemState => {
      return {...initialState, loadingState: 'loading'};
    }),
    on(ExternalMapItemActions.setItem, (): ExternalMapItemState => {
      return {...initialState, loadingState: 'loaded'};
    }),
    on(ExternalMapItemActions.setItemError, (): ExternalMapItemState => {
      return {...initialState, loadingState: 'error'};
    }),
    on(ExternalMapItemActions.clearLoadingState, (): ExternalMapItemState => {
      return initialState;
    }),
  ),
});

export const {name, reducer, selectExternalMapItemState, selectLoadingState} = externalMapItemFeature;
