import {createSelector} from '@ngrx/store';
import {selectMapConfigState} from '../reducers/map-config.reducer';
import {NumberUtils} from '../../../shared/utils/number.utils';
import {selectTopicIdsForUrl} from './active-map-items.selector';
import {selectPendingInitialTopicIds} from '../reducers/layer-catalog.reducer';

export const selectMapConfigParams = createSelector(selectMapConfigState, (mapConfigState) => {
  return {
    x: NumberUtils.roundToDecimals(mapConfigState.center.x),
    y: NumberUtils.roundToDecimals(mapConfigState.center.y),
    scale: NumberUtils.roundToDecimals(mapConfigState.scale),
    basemap: mapConfigState.activeBasemapId,
  };
});

export const selectMapPageParams = createSelector(
  selectMapConfigParams,
  selectPendingInitialTopicIds,
  selectTopicIdsForUrl,
  (mapConfigParams, pendingTopicIds, activeTopicIds) => {
    // Keep the requested topics stable until the catalogue has resolved them. Otherwise an early map extent update could briefly remove
    // the deep-link parameter before the initial map items are available.
    const topicIds = pendingTopicIds ?? activeTopicIds;
    return {
      ...mapConfigParams,
      topics: topicIds.length > 0 ? topicIds.join(',') : null,
    };
  },
);
