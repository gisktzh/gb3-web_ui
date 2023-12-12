import {createSelector} from '@ngrx/store';
import {selectLayerSelections} from '../reducers/map-import.reducer';
import {ExternalLayerId} from '../../../shared/types/external-layer-id.type';

export const selectAllSelectedLayerIds = createSelector(selectLayerSelections, (layerSelections): ExternalLayerId[] => {
  if (!layerSelections) {
    return [];
  }
  return layerSelections.filter((layerSelection) => layerSelection.isSelected).map((layerSelection) => layerSelection.layer.id);
});

export const selectIsAnyLayerSelected = createSelector(selectLayerSelections, (layerSelections): boolean => {
  if (!layerSelections) {
    return false;
  }
  return layerSelections.some((layerSelection) => layerSelection.isSelected);
});

export const selectAreAllLayersSelected = createSelector(selectLayerSelections, (layerSelections): boolean => {
  if (!layerSelections) {
    return false;
  }
  return layerSelections.every((layerSelection) => layerSelection.isSelected);
});

export const selectAreSomeButNotAllLayersSelected = createSelector(selectLayerSelections, (layerSelections): boolean => {
  if (!layerSelections) {
    return false;
  }
  return (
    layerSelections.some((layerSelection) => layerSelection.isSelected) &&
    layerSelections.some((layerSelection) => !layerSelection.isSelected)
  );
});
