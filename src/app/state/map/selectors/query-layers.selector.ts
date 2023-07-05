import {createSelector} from '@ngrx/store';
import {selectItems} from '../reducers/active-map-item.reducer';
import {QueryLayer} from '../../../shared/interfaces/query-layer.interface';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';

export const selectQueryLayers = createSelector(selectItems, (activeMapItems) => {
  const queryLayers: QueryLayer[] = activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).map((mapItem) => {
    const layersToQuery: string[] = mapItem.settings.layers.filter((layer) => layer.queryable).map((layer) => layer.layer);
    const queryLayer: QueryLayer = {
      topic: mapItem.settings.mapId,
      layersToQuery: layersToQuery.join(',')
    };
    return queryLayer;
  });
  return queryLayers;
});
