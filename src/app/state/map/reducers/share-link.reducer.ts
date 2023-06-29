import {createFeature, createReducer, on} from '@ngrx/store';
import {ShareLinkActions} from '../actions/share-link.actions';
import {ShareLinkState} from '../states/share-link.state';

export const shareLinkFeatureKey = 'shareLink';

export const initialState: ShareLinkState = {
  shareLinkItem: undefined,
  shareLinkId: undefined,
  loadingState: 'undefined',
  savingState: 'undefined'
};

export const shareLinkFeature = createFeature({
  name: shareLinkFeatureKey,
  reducer: createReducer(
    initialState,
    on(ShareLinkActions.loadShareLinkItem, (state): ShareLinkState => {
      return {...state, shareLinkItem: initialState.shareLinkItem, loadingState: 'loading'};
    }),
    on(ShareLinkActions.setShareLinkItem, (state, {shareLinkItem}): ShareLinkState => {
      return {...state, shareLinkItem: shareLinkItem, loadingState: 'loaded'};
    }),
    on(ShareLinkActions.createShareLinkId, (state): ShareLinkState => {
      return {...state, shareLinkId: initialState.shareLinkId, savingState: 'loading'};
    }),
    on(ShareLinkActions.setShareLinkId, (state, {shareLinkId}): ShareLinkState => {
      return {...state, shareLinkId, savingState: 'loaded'};
    })
  )
});

export const {name, reducer, selectShareLinkItem, selectLoadingState, selectShareLinkId, selectSavingState} = shareLinkFeature;
