import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {QueryLayer} from '../../../shared/interfaces/query-layer.interface';
import {Gb2WmsMapItemConfiguration} from '../../../map/models/active-map-item.model';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';

export const selectQueryLayers = createSelector(selectActiveMapItems, (activeMapItems) => {
  const queryLayers: QueryLayer[] = [];

  activeMapItems.filter(isActiveMapItemOfType(Gb2WmsMapItemConfiguration)).map((mapItem) => {
    const layersToQuery: string[] = mapItem.configuration.layers.filter((layer) => layer.queryable).map((layer) => layer.layer);
    const queryLayer: QueryLayer = {
      topic: mapItem.configuration.mapId,
      layersToQuery: layersToQuery.join(',')
    };

    queryLayers.push(queryLayer);
  });

  return queryLayers;
});
