import {createFeature, createReducer, on} from '@ngrx/store';
import {ShareLinkActions} from '../actions/share-link.actions';
import {ShareLinkState} from '../states/share-link.state';

export const shareLinkFeatureKey = 'shareLink';

export const initialState: ShareLinkState = {
  item: undefined,
  id: undefined,
  loadingState: 'undefined',
  savingState: 'undefined',
  initializeApplicationLoadingState: 'undefined',
};

export const shareLinkFeature = createFeature({
  name: shareLinkFeatureKey,
  reducer: createReducer(
    initialState,
    on(ShareLinkActions.loadItem, (state): ShareLinkState => {
      return {...state, item: initialState.item, loadingState: 'loading'};
    }),
    on(ShareLinkActions.setLoadingError, (state): ShareLinkState => {
      return {...state, item: initialState.item, loadingState: 'error'};
    }),
    on(ShareLinkActions.setItem, (state, {item}): ShareLinkState => {
      return {...state, item, loadingState: 'loaded'};
    }),
    on(ShareLinkActions.createItem, (state): ShareLinkState => {
      return {...state, id: initialState.id, savingState: 'loading'};
    }),
    on(ShareLinkActions.setCreationError, (state): ShareLinkState => {
      return {...state, id: initialState.id, savingState: 'error'};
    }),
    on(ShareLinkActions.setItemId, (state, {id}): ShareLinkState => {
      return {...state, id, savingState: 'loaded'};
    }),
    on(ShareLinkActions.initializeApplicationBasedOnId, (state): ShareLinkState => {
      return {...initialState, initializeApplicationLoadingState: 'loading'};
    }),
    on(ShareLinkActions.setInitializationError, (state): ShareLinkState => {
      return {...state, initializeApplicationLoadingState: 'error'};
    }),
    on(ShareLinkActions.completeApplicationInitialization, (state): ShareLinkState => {
      return {...state, initializeApplicationLoadingState: 'loaded'};
    }),
  ),
});

export const {name, reducer, selectItem, selectLoadingState, selectId, selectSavingState, selectInitializeApplicationLoadingState} =
  shareLinkFeature;
