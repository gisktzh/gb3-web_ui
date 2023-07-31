import {createSelector} from '@ngrx/store';
import {selectMapConfigState} from '../reducers/map-config.reducer';
import {MapConfigState} from '../states/map-config.state';

export const selectFavouriteMapConfig = createSelector<
  Record<string, any>,
  MapConfigState,
  Pick<MapConfigState, 'center' | 'scale' | 'activeBasemapId'>
>(selectMapConfigState, ({activeBasemapId, center, scale}) => {
  return {
    center: center,
    scale: scale,
    activeBasemapId: activeBasemapId,
  };
});
