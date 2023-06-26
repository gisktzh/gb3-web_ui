import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';

export const selectDrawingLayers = createSelector(selectActiveMapItems, (activeMapItems) => {
  // todo: extend and return an object containing all
  return activeMapItems.filter((activeMapItem) => activeMapItem.id === 'measurement');
});
