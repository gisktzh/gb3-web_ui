import {createSelector} from '@ngrx/store';
import {ShareLinkItem} from 'src/app/shared/interfaces/share-link.interface';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {selectActiveBasemapId, selectMapConfigState} from '../reducers/map-config.reducer';

export const selectCurrentShareLinkItem = createSelector(
  selectActiveMapItems,
  selectMapConfigState,
  selectActiveBasemapId,
  (activeMapItems, mapConfigState, activeBasemapId) => {
    const shareLinkItem: ShareLinkItem = {
      center: mapConfigState.center,
      scale: mapConfigState.scale,
      basemapId: activeBasemapId,
      content: [],
      drawings: [],
      measurements: []
    };
    return shareLinkItem;
  }
);
