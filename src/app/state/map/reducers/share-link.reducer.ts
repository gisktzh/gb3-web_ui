import {createFeature, createReducer, on} from '@ngrx/store';
import {ShareLinkActions} from '../actions/share-link.actions';
import {ShareLinkState} from '../states/share-link.state';

export const shareLinkFeatureKey = 'shareLink';

export const initialState: ShareLinkState = {
  item: undefined,
  id: undefined,
  loadingState: 'undefined',
  savingState: 'undefined',
  applicationInitializationLoadingState: 'undefined',
};

export const shareLinkFeature = createFeature({
  name: shareLinkFeatureKey,
  reducer: createReducer(
    initialState,
    on(ShareLinkActions.loadItem, (state): ShareLinkState => {
      return {...state, item: initialState.item, loadingState: 'loading'};
    }),
    on(ShareLinkActions.setLoadingError, (): ShareLinkState => {
      return {...initialState, loadingState: 'error'};
    }),
    on(ShareLinkActions.setItem, (state, {item}): ShareLinkState => {
      return {...state, item, loadingState: 'loaded'};
    }),
    on(ShareLinkActions.createItem, (state): ShareLinkState => {
      return {...state, id: initialState.id, savingState: 'loading'};
    }),
    on(ShareLinkActions.setCreationError, (): ShareLinkState => {
      return {...initialState, savingState: 'error'};
    }),
    on(ShareLinkActions.setItemId, (state, {id}): ShareLinkState => {
      return {...state, id, savingState: 'loaded'};
    }),
    on(ShareLinkActions.initializeApplicationBasedOnId, (): ShareLinkState => {
      return {...initialState, applicationInitializationLoadingState: 'loading'};
    }),
    on(ShareLinkActions.setInitializationError, (): ShareLinkState => {
      return {...initialState, applicationInitializationLoadingState: 'error'};
    }),
    on(ShareLinkActions.completeApplicationInitialization, (state): ShareLinkState => {
      return {...state, applicationInitializationLoadingState: 'loaded'};
    }),
  ),
});

export const {name, reducer, selectItem, selectLoadingState, selectId, selectSavingState, selectApplicationInitializationLoadingState} =
  shareLinkFeature;
