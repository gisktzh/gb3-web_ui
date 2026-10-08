import {createSelector} from '@ngrx/store';
import {selectItems} from '../selectors/active-map-items.selector';
import {selectScale} from '../reducers/map-config.reducer';
import {QueryTopic} from '../../../shared/interfaces/query-topic.interface';
import {findVisibleMapLayers} from '../../../map/utils/visible-map-layers.utils';

/**
 * Returns all activeMapItems that should be queried for a featureinfo, if
 * * they are of type Gb2WmsActiveMapItem
 * * they are currently visible
 *
 * It maps them to a QueryLayer array which contains the actual layers that should be queried. Here, also those sublayers which are not
 * visible are filtered out.
 */
export const selectQueryLayers = createSelector(selectItems, selectScale, (activeMapItems, scale) => {
  const queryTopics: QueryTopic[] = findVisibleMapLayers(activeMapItems, scale).map(({item: mapItem, layers}) => {
    const layersToQuery: string[] = layers.filter((layer) => layer.queryable).map((layer) => layer.layer);
    return {
      topic: mapItem.settings.mapId,
      layersToQuery: layersToQuery.join(','),
      isSingleLayer: mapItem.isSingleLayer,
      filterConfigurations: mapItem.settings.filterConfigurations,
      timeSliderConfiguration: mapItem.settings.timeSliderConfiguration,
      timeSliderExtent: mapItem.settings.timeSliderExtent,
    };
  });

  return queryTopics.filter((queryTopic) => queryTopic.layersToQuery !== '');
});
