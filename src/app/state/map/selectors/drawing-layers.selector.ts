import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layers.enum';

export const selectDrawingLayers = createSelector(selectActiveMapItems, (activeMapItems) => {
  // todo: extend and return an object containing all
  return activeMapItems.filter((activeMapItem) => activeMapItem.id === UserDrawingLayer.Measurements);
});
