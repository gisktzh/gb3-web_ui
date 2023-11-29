import {createSelector} from '@ngrx/store';
import {selectItems as selectLegendItems} from '../reducers/legend.reducer';
import {selectMaps} from './maps.selector';
import {LegendDisplay} from '../../../shared/interfaces/legend.interface';
import {selectItems as selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';

export const selectLegendItemsForDisplay = createSelector(
  selectLegendItems,
  selectMaps,
  selectActiveMapItems,
  (legendItems, maps, activeMapItems): LegendDisplay[] => {
    const legendDisplays: LegendDisplay[] = [];
    legendItems.forEach((legendItem) => {
      // Abort if the legend endpoint returns a non-matchable topic ID
      const topic = maps.find((map) => map.id === legendItem.topic);
      if (!topic) {
        return;
      }

      // Also abort if the legend isn't part of the active map items anymore
      const activeMapItem = activeMapItems
        .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
        .find((item) => item.settings.mapId === legendItem.topic);
      if (!activeMapItem) {
        return;
      }

      let legendDisplay: LegendDisplay;
      if (legendItem.isSingleLayer) {
        legendDisplay = {
          id: Gb2WmsActiveMapItem.createSingleLayerId(topic.id, legendItem.layers[0].layer),
          mapId: topic.id,
          title: legendItem.layers[0].title,
          layers: legendItem.layers,
          icon: undefined,
          isSingleLayer: true,
          metaDataLink: legendItem.layers[0].metaDataLink, // make sure we take the layer's metaDataLink and not its topic's one
        };
      } else {
        legendDisplay = {
          id: topic.id,
          mapId: topic.id,
          title: topic.title,
          layers: legendItem.layers,
          icon: topic.icon,
          isSingleLayer: false,
          metaDataLink: legendItem.metaDataLink,
        };
      }

      legendDisplays.push(legendDisplay);
    });
    return legendDisplays;
  },
);
