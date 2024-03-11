import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {Favourite} from '../../../shared/interfaces/favourite.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';

export const FavouriteListActions = createActionGroup({
  source: 'FavouriteList',
  events: {
    'Load Favourites': emptyProps(),
    'Set Favourites': props<{favourites: Favourite[]}>(),
    'Clear Favourites': emptyProps(),
    'Set Invalid': props<{id: string; error: unknown}>(),
    'Remove Favourite': props<{id: string}>(),
    'Set Error': errorProps(),
    'Display Error': props<{message: string}>(),
  },
});
