import {createSelector} from '@ngrx/store';
import {selectMapConfigState} from '../reducers/map-config.reducer';
import {NumberUtils} from '../../../shared/utils/number.utils';

export const selectMapConfigParams = createSelector(selectMapConfigState, (mapConfigState) => {
  return {
    x: NumberUtils.roundToDecimals(mapConfigState.center.x),
    y: NumberUtils.roundToDecimals(mapConfigState.center.y),
    scale: NumberUtils.roundToDecimals(mapConfigState.scale),
    basemap: mapConfigState.activeBasemapId,
  };
});
