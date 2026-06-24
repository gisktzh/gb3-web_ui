import {createSelector} from '@ngrx/store';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {QueryTopic} from '../../../shared/interfaces/query-topic.interface';
import {selectScale} from '../reducers/map-config.reducer';
import {selectItems} from './active-map-items.selector';

export const selectQueryLegends = createSelector(selectItems, selectScale, (activeMapItems, scale) => {
  const queryTopics: QueryTopic[] = activeMapItems
    .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
    .filter((activeMapItem) => activeMapItem.visible)
    .map((mapItem) => {
      const layersToQuery: string[] = mapItem.settings.layers
        .filter((layer) => layer.visible && layer.minScale < scale && layer.maxScale > scale)
        .map((layer) => layer.layer);
      return {
        topic: mapItem.settings.mapId,
        layersToQuery: layersToQuery.join(','),
        isSingleLayer: mapItem.isSingleLayer,
      };
    });

  return queryTopics.filter((queryTopic) => queryTopic.layersToQuery !== '');
});

export const selectNumberOfQueryLegends = createSelector(selectQueryLegends, (currentActiveMapItems) => currentActiveMapItems.length);
