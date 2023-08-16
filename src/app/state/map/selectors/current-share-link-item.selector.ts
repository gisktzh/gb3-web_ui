import {createSelector} from '@ngrx/store';
import {ShareLinkItem} from 'src/app/shared/interfaces/share-link.interface';
import {selectActiveBasemapId, selectMapConfigState} from '../reducers/map-config.reducer';
import {selectActiveMapItemConfigurations} from './active-map-item-configuration.selector';

export const selectCurrentShareLinkItem = createSelector(
  selectActiveMapItemConfigurations,
  selectMapConfigState,
  selectActiveBasemapId,
  (activeMapItemConfigurations, mapConfigState, activeBasemapId) => {
    const shareLinkItem: ShareLinkItem = {
      center: mapConfigState.center,
      scale: mapConfigState.scale,
      basemapId: activeBasemapId,
      content: activeMapItemConfigurations,
      drawings: [], // TODO: Add drawings as soon as they're ready
      measurements: [], // TODO: Add measurements as soon as they're ready
    };
    return shareLinkItem;
  },
);
