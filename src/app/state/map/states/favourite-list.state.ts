import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {Favourite} from '../../../shared/interfaces/favourite.interface';

export interface FavouriteListState extends HasLoadingState {
  favourites: Favourite[];
}
