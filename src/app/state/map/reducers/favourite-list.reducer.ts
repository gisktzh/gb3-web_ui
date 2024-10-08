import {createFeature, createReducer, on} from '@ngrx/store';
import {FavouriteListActions} from '../actions/favourite-list.actions';
import {FavouriteListState} from '../states/favourite-list.state';
import {produce} from 'immer';

export const favouriteListFeatureKey = 'favouriteList';

export const initialState: FavouriteListState = {
  favourites: [],
  loadingState: undefined,
};

export const favouriteListeFeature = createFeature({
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
    on(
      FavouriteListActions.setInvalid,
      produce((draft, {id}) => {
        draft.favourites.find((favourite) => favourite.id === id)!.invalid = true;
      }),
    ),
    on(FavouriteListActions.removeFavourite, (state, {id}): FavouriteListState => {
      const remainingFavourites = state.favourites.filter((favourite) => favourite.id !== id);

      return {...state, favourites: remainingFavourites};
    }),
    on(FavouriteListActions.setError, (): FavouriteListState => {
      return {...initialState, loadingState: 'error'};
    }),
  ),
});

export const {name, reducer, selectFavourites, selectLoadingState} = favouriteListeFeature;
