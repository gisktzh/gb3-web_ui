import {createSelector} from '@ngrx/store';
import {ShareLinkItem} from 'src/app/shared/interfaces/share-link.interface';
import {selectActiveBasemapId, selectMapConfigState} from '../reducers/map-config.reducer';
import {selectActiveMapItemConfigurations} from './active-map-item-configuration.selector';

import {selectUserDrawingsVectorLayers} from './user-drawings-vector-layers.selector';

export const selectCurrentShareLinkItem = createSelector(
  selectActiveMapItemConfigurations,
  selectMapConfigState,
  selectActiveBasemapId,
  selectUserDrawingsVectorLayers,
  (activeMapItemConfigurations, mapConfigState, activeBasemapId, userDrawingsVectorLayers) => {
    const shareLinkItem: ShareLinkItem = {
      center: mapConfigState.center,
      scale: mapConfigState.scale,
      basemapId: activeBasemapId,
      content: activeMapItemConfigurations,
      ...userDrawingsVectorLayers,
    };
    return shareLinkItem;
  },
);
