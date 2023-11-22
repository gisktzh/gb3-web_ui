import {createSelector} from '@ngrx/store';
import {selectMaps} from './maps.selector';
import {selectItems} from '../reducers/active-map-item.reducer';
import {selectData} from '../reducers/feature-info.reducer';
import {FeatureInfoResultDisplay} from '../../../shared/interfaces/feature-info.interface';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';

export const selectFeatureInfosForDisplay = createSelector(
  selectData,
  selectMaps,
  selectItems,
  (featureInfoResult, maps, activeMapItems): FeatureInfoResultDisplay[] => {
    const featureInfoResultDisplays: FeatureInfoResultDisplay[] = [];
    featureInfoResult.forEach((featureInfo) => {
      // Abort if a featureinfo returned no hits for any of its layers.
      if (featureInfo.layers.every((featureInfoLayer) => featureInfoLayer.features.length === 0)) {
        return;
      }

      // Also abort if the featureInfo endpoint returns a non-matchable topic ID
      const topic = maps.find((map) => map.id === featureInfo.topic);
      if (!topic) {
        return;
      }

      // Also abort if the featureInfo isn't part of the active map items anymore
      const activeMapItem = activeMapItems
        .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
        .find((item) => item.settings.mapId === featureInfo.topic);
      if (!activeMapItem) {
        return;
      }

      let featureInfoResultDisplay: FeatureInfoResultDisplay;
      if (featureInfo.isSingleLayer) {
        featureInfoResultDisplay = {
          id: Gb2WmsActiveMapItem.createSingleLayerId(topic.id, featureInfo.layers[0].layer),
          title: featureInfo.layers[0].title,
          layers: featureInfo.layers,
          icon: undefined,
          isSingleLayer: true,
          metaDataLink: featureInfo.metaDataLink,
          mapId: topic.id,
        };
      } else {
        featureInfoResultDisplay = {
          id: topic.id,
          title: topic.title,
          layers: featureInfo.layers,
          icon: topic.icon,
          isSingleLayer: false,
          metaDataLink: featureInfo.metaDataLink,
          mapId: topic.id,
        };
      }

      featureInfoResultDisplays.push(featureInfoResultDisplay);
    });
    return featureInfoResultDisplays;
  },
);
