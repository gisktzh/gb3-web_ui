import {createSelector} from '@ngrx/store';
import {selectCenter, selectScale} from '../reducers/map-config.reducer';
import {NumberUtils} from 'src/app/shared/utils/number.utils';

export const selectRoundedScale = createSelector(selectScale, (scale) => NumberUtils.roundToDecimals(scale));

export const selectCenterReadable = createSelector(
  selectCenter,
  ({x, y}) => `${NumberUtils.roundToDecimals(x)} / ${NumberUtils.roundToDecimals(y)}`,
);
