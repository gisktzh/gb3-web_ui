import {createSelector} from '@ngrx/store';
import {selectItems} from '../selectors/active-map-items.selector';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';

export const selectDrawingLayers = createSelector(selectItems, (activeMapItems) => {
  // todo: extend and return an object containing all
  return activeMapItems.filter(isActiveMapItemOfType(DrawingActiveMapItem));
});
