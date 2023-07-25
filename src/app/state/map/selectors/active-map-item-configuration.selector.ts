import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {createSelector} from '@ngrx/store';
import {selectItems} from '../reducers/active-map-item.reducer';
import {ActiveMapItemConfiguration} from '../../../shared/interfaces/active-map-item-configuration.interface';

export const selectActiveMapItemConfigurations = createSelector(selectItems, (activeMapItems) => {
  const activeMapItemConfigurations: ActiveMapItemConfiguration[] = activeMapItems
    .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
    .map((activeMapItem) => {
      // note: spread does not work here because ActiveMapItem is a class, hence too many attributes would be added to the object
      return {
        mapId: activeMapItem.settings.mapId,
        layers: activeMapItem.settings.layers.map((layer) => ({id: layer.id, layer: layer.layer, visible: layer.visible})),
        visible: activeMapItem.visible,
        opacity: activeMapItem.opacity,
        isSingleLayer: activeMapItem.isSingleLayer,
      };
    });
  return activeMapItemConfigurations;
});
