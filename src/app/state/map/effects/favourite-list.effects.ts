import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, switchMap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {FavouriteListActions} from '../actions/favourite-list.actions';
import {Gb3FavouritesService} from '../../../shared/services/apis/gb3/gb3-favourites.service';

@Injectable()
export class FavouriteListEffects {
  public dispatchFavouriteListRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FavouriteListActions.loadFavourites),
      switchMap(() =>
        this.favouritesService.loadFavourites().pipe(
          map((favourites) => {
            return FavouriteListActions.setFavourites({favourites});
          }),
          catchError(() => EMPTY)
        )
      )
    );
  });

  constructor(private readonly actions$: Actions, private readonly favouritesService: Gb3FavouritesService) {}
}
