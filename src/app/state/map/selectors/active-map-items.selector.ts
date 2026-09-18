import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {createSelector} from '@ngrx/store';
import {selectActiveMapItemState} from '../reducers/active-map-item.reducer';

/**
 * Returns all activeMapItems from the activeMapItemState.
 */
export const selectAllItems = createSelector(selectActiveMapItemState, (state) => state.items);

/**
 * Returns all activeMapItems from the activeMapItemState that are not temporary.
 */
export const selectItems = createSelector(selectAllItems, (activeMapItems) => {
  return activeMapItems.filter((activeMapItem) => !activeMapItem.isTemporary);
});

/**
 * Returns the topic ids which can be represented by the browser URL.
 *
 * Only complete, non-temporary GB2 WMS topics are included. Single layers and
 * other active map item types need the richer share-link representation.
 */
export const selectTopicIdsForUrl = createSelector(selectItems, (activeMapItems) => {
  return [
    ...new Set(
      activeMapItems
        .filter((activeMapItem) => !activeMapItem.isTemporary)
        .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
        .filter((activeMapItem) => !activeMapItem.isSingleLayer)
        .map((activeMapItem) => activeMapItem.settings.mapId),
    ),
  ];
});

/**
 * Returns all activeMapItems from the activeMapItemState that have a map notice set and are not temporary.
 */
export const selectGb2WmsActiveMapItemsWithMapNotices = createSelector(selectItems, (activeMapItems) => {
  return activeMapItems
    .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
    .filter((gb2WmsActiveMapItem) => gb2WmsActiveMapItem.settings.notice);
});

/**
 * Returns all activeMapItems from the activeMapItemState that are temporary.
 */
export const selectTemporaryMapItems = createSelector(selectAllItems, (activeMapItems) => {
  return activeMapItems.filter((activeMapItem) => activeMapItem.isTemporary);
});
