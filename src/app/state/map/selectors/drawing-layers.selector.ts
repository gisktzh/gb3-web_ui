import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';

export const selectDrawingLayers = createSelector(selectActiveMapItems, (activeMapItems) => {
  // todo: extend and return an object containing all
  return activeMapItems.filter(isActiveMapItemOfType(DrawingActiveMapItem));
});
