import {createSelector} from '@ngrx/store';
import {selectItems} from '../reducers/active-map-item.reducer';
import {selectScale} from '../reducers/map-config.reducer';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {QueryTopic} from '../../../shared/interfaces/query-topic.interface';
import {selectDevMode} from '../../app/reducers/app.reducer';

/**
 * Returns all activeMapItems that should be queried for a featureinfo, if
 * * they are of type Gb2WmsActiveMapItem
 * * they are currently visible
 *
 * It maps them to a QueryLayer array which contains the actual layers that should be queried. Here, also those sublayers which are not
 * visible are filtered out.
 */
export const selectQueryLayers = createSelector(selectItems, selectScale, selectDevMode, (activeMapItems, scale, isDevModeActive) => {
  const queryTopics: QueryTopic[] = activeMapItems
    .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
    .filter((activeMapItem) => activeMapItem.visible || isDevModeActive)
    .map((mapItem) => {
      const layersToQuery: string[] = mapItem.settings.layers
        .filter((layer) => layer.queryable && ((layer.visible && layer.minScale < scale && layer.maxScale > scale) || isDevModeActive))
        .map((layer) => layer.layer);
      return {
        topic: mapItem.settings.mapId,
        layersToQuery: layersToQuery.join(','),
        isSingleLayer: mapItem.isSingleLayer,
      };
    });

  return queryTopics.filter((queryTopic) => queryTopic.layersToQuery !== '');
});
