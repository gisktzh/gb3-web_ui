import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs';
import {FavouriteListActions} from '../actions/favourite-list.actions';
import {FavouritesService} from '../../../map/services/favourites.service';

import {FavouriteCouldNotBeLoaded, FavouritesCouldNotBeLoaded} from '../../../shared/errors/favourite.errors';

@Injectable()
export class FavouriteListEffects {
  private readonly actions$ = inject(Actions);
  private readonly favouritesService = inject(FavouritesService);

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

  public displayError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(FavouriteListActions.setInvalid),
        tap(({error}) => {
          throw new FavouriteCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );
}
