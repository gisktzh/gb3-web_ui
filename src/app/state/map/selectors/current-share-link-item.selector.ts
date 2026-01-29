import {createSelector} from '@ngrx/store';
import {selectActiveBasemapId, selectMapConfigState} from '../reducers/map-config.reducer';
import {selectActiveMapItemConfigurations} from './active-map-item-configuration.selector';
import {selectUserDrawingsVectorLayers} from './user-drawings-vector-layers.selector';
import {InternalShareLinkItem} from 'src/app/shared/interfaces/internal-share-link.interface';

export const selectCurrentInternalShareLinkItem = createSelector(
  selectActiveMapItemConfigurations,
  selectMapConfigState,
  selectActiveBasemapId,
  selectUserDrawingsVectorLayers,
  (activeMapItemConfigurations, mapConfigState, activeBasemapId, userDrawingsVectorLayers) => {
    const shareLinkItem: InternalShareLinkItem = {
      center: mapConfigState.center,
      scale: mapConfigState.scale,
      basemapId: activeBasemapId,
      content: activeMapItemConfigurations,
      ...userDrawingsVectorLayers,
    };
    return shareLinkItem;
  },
);
