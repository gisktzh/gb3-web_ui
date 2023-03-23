import {createSelector} from '@ngrx/store';
import {selectFilterString} from '../reducers/layer-catalog.reducer';
import {selectFavourites} from '../reducers/favourite-list.reducer';

export const selectFilteredFavouriteList = createSelector(selectFilterString, selectFavourites, (filterString, favourites) => {
  const lowerCasedFilterString = filterString.toLowerCase();
  if (lowerCasedFilterString === '') {
    return favourites;
  }

  return favourites.filter((favourite) => favourite.title.toLowerCase().includes(lowerCasedFilterString));
});
