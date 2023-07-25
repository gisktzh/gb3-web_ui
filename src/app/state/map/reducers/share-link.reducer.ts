import {createFeature, createReducer, on} from '@ngrx/store';
import {ShareLinkActions} from '../actions/share-link.actions';
import {ShareLinkState} from '../states/share-link.state';

export const shareLinkFeatureKey = 'shareLink';

export const initialState: ShareLinkState = {
  item: undefined,
  id: undefined,
  loadingState: 'undefined',
  savingState: 'undefined',
};

export const shareLinkFeature = createFeature({
  name: shareLinkFeatureKey,
  reducer: createReducer(
    initialState,
    on(ShareLinkActions.loadShareLinkItem, (state): ShareLinkState => {
      return {...state, item: initialState.item, loadingState: 'loading'};
    }),
    on(ShareLinkActions.setShareLinkItem, (state, {item}): ShareLinkState => {
      return {...state, item, loadingState: 'loaded'};
    }),
    on(ShareLinkActions.createShareLinkItem, (state): ShareLinkState => {
      return {...state, id: initialState.id, savingState: 'loading'};
    }),
    on(ShareLinkActions.setShareLinkId, (state, {id}): ShareLinkState => {
      return {...state, id, savingState: 'loaded'};
    }),
  ),
});

export const {name, reducer, selectItem, selectLoadingState, selectId, selectSavingState} = shareLinkFeature;
