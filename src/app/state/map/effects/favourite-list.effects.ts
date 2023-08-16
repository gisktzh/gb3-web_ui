import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {FavouriteListActions} from '../actions/favourite-list.actions';
import {FavouritesService} from '../../../map/services/favourites.service';

import {FavouritesCouldNotBeLoaded} from '../../../shared/errors/favourite.errors';

@Injectable()
export class FavouriteListEffects {
  public requestFavouriteList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FavouriteListActions.loadFavourites),
      switchMap(() =>
        this.favouritesService.loadFavourites().pipe(
          map((favourites) => {
            return FavouriteListActions.setFavourites({favourites});
          }),
          catchError((error: unknown) => of(FavouriteListActions.setError({error}))),
        ),
      ),
    );
  });

  public setError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(FavouriteListActions.setError),
        tap(({error}) => {
          throw new FavouritesCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    private readonly favouritesService: FavouritesService,
  ) {}
}
