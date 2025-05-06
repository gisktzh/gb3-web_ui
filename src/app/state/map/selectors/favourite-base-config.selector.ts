import {createSelector} from '@ngrx/store';
import {selectMapConfigState} from '../reducers/map-config.reducer';
import {MapConfigState} from '../states/map-config.state';

import {FavouriteBaseConfig} from '../../../shared/interfaces/favourite.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- official Record type from ngrx
export const selectFavouriteBaseConfig = createSelector<Record<string, any>, MapConfigState, FavouriteBaseConfig>(
  selectMapConfigState,
  ({activeBasemapId, center, scale}) => {
    return {
      center: center,
      scale: scale,
      basemap: activeBasemapId,
    };
  },
);
