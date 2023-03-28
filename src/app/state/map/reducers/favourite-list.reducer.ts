import {createFeature, createReducer, on} from '@ngrx/store';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {Favourite} from '../../../shared/interfaces/favourite.interface';
import {FavouriteListActions} from '../actions/favourite-list.actions';

export const favouriteListFeatureKey = 'favouriteList';

export interface FavouriteListState extends HasLoadingState {
  favourites: Favourite[];
}

export const initialState: FavouriteListState = {
  favourites: [],
  loadingState: 'undefined'
};

export const favourteListeFeature = createFeature({
  name: favouriteListFeatureKey,
  reducer: createReducer(
    initialState,
    on(FavouriteListActions.loadFavourites, (): FavouriteListState => {
      return {...initialState, loadingState: 'loading'};
    }),
    on(FavouriteListActions.setFavourites, (state, {favourites}): FavouriteListState => {
      return {...state, favourites, loadingState: 'loaded'};
    }),
    on(FavouriteListActions.clearFavourites, (state): FavouriteListState => {
      return {...state, favourites: []};
    }),
    on(FavouriteListActions.setInvalid, (state, {id}): FavouriteListState => {
      const {favourites} = structuredClone(state);

      favourites.find((favourite) => favourite.id === id)!.invalid = true;

      return {...state, favourites};
    })
  )
});

export const {name, reducer, selectFavourites, selectLoadingState} = favourteListeFeature;
