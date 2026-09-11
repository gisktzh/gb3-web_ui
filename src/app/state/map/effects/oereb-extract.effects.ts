import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable, inject} from '@angular/core';
import {OerebExtractActions} from '../actions/oereb-extract.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {catchError, iif, map, of, switchMap, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {concatLatestFrom} from '@ngrx/operators';
import {selectHasOerebMapActive} from '../selectors/has-oereb-map-active.selector';
import {OerebExtractCouldNotBeLoaded} from 'src/app/shared/errors/map.errors';
import {Gb3OerebExtractService} from 'src/app/shared/services/apis/gb3/gb3-oereb-extract.service';

@Injectable()
export class OerebExtractEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly oerebExtractService = inject(Gb3OerebExtractService);

  public clearData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapConfigActions.clearFeatureInfoContent),
      map(() => OerebExtractActions.clearContent()),
    );
  });

  public interceptMapClick$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapConfigActions.handleMapClick),
      concatLatestFrom(() => this.store.select(selectHasOerebMapActive)),
      switchMap(([{x, y}, hasOerebMapActive]) =>
        iif(
          () => hasOerebMapActive,
          of(OerebExtractActions.sendRequest({x, y})),
          of(OerebExtractActions.updateContent({oerebExtract: null})),
        ),
      ),
    );
  });

  public requestOerebExtract$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OerebExtractActions.sendRequest),
      switchMap(({x, y}) =>
        this.oerebExtractService.loadOerebExtract(x, y).pipe(
          map((oerebExtract) => {
            return OerebExtractActions.updateContent({oerebExtract});
          }),
          catchError((error: unknown) => of(OerebExtractActions.setError({error}))),
        ),
      ),
    );
  });

  public setError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(OerebExtractActions.setError),
        tap(({error}) => {
          throw new OerebExtractCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );
}
