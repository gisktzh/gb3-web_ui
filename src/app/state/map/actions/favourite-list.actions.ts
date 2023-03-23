import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {Favourite} from '../../../shared/interfaces/favourite.interface';

export const FavouriteListActions = createActionGroup({
  source: 'FavouriteList',
  events: {
    'Load Favourites': emptyProps(),
    'Set Favourites': props<{favourites: Favourite[]}>(),
    'Clear Favourites': emptyProps(),
    'Set Invalid': props<{id: number}>()
  }
});
