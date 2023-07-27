import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {Store} from '@ngrx/store';
import {LegendActions} from '../actions/legend.actions';
import {selectQueryLegends} from '../selectors/query-legends.selector';

import {LegendCouldNotBeLoaded} from '../../../shared/errors/map.errors';

@Injectable()
export class LegendEffects {
  public legendRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LegendActions.loadLegend),
      concatLatestFrom(() => this.store.select(selectQueryLegends)),
      switchMap(([_, queryLegends]) =>
        this.topicsService.loadLegends(queryLegends).pipe(
          map((legends) => {
            return LegendActions.addLegendContent({legends});
          }),
          catchError((error: unknown) => of(LegendActions.setError({error}))),
        ),
      ),
    );
  });

  public setError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(LegendActions.setError),
        tap(({error}) => {
          throw new LegendCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    private readonly topicsService: Gb3TopicsService,
    private readonly store: Store,
  ) {}
}
