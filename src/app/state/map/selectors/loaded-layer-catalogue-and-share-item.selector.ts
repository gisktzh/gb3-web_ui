import {createSelector} from '@ngrx/store';
import {selectItems, selectLoadingState as selectLayerCatalogLoadingState} from '../reducers/layer-catalog.reducer';
import {Topic} from '../../../shared/interfaces/topic.interface';
import {selectItem, selectLoadingState as selectShareLinkLoadingState} from '../reducers/share-link.reducer';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';

export const selectLoadedLayerCatalogueAndShareItem = createSelector(
  selectItems,
  selectLayerCatalogLoadingState,
  selectItem,
  selectShareLinkLoadingState,
  (topics, layerCatalogLoadingState, shareLinkItem, shareLinkLoadingState): {topics: Topic[]; shareLinkItem: ShareLinkItem} | undefined => {
    if (layerCatalogLoadingState !== 'loaded' || shareLinkLoadingState !== 'loaded' || shareLinkItem === undefined) {
      return undefined;
    }
    return {topics, shareLinkItem};
  },
);
