import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {ExportActions} from '../actions/export.actions';
import {Gb3ExportService} from '../../../shared/services/apis/gb3/gb3-export.service';
import {selectUserDrawingsVectorLayers} from '../selectors/user-drawings-vector-layers.selector';
import {concatLatestFrom} from '@ngrx/operators';
import {DrawingCouldNotBeExported} from '../../../shared/errors/export.errors';

@Injectable()
export class ExportEffects {
  public requestExportDrawings$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExportActions.requestExportDrawings),
      concatLatestFrom(() => this.store.select(selectUserDrawingsVectorLayers)),
      switchMap(([{exportFormat}, drawings]) =>
        this.exportService.exportDrawing(exportFormat, drawings.drawings).pipe(
          map(() => ExportActions.setExportDrawingsRequestResponse()),
          catchError((error: unknown) => of(ExportActions.setExportDrawingsRequestError({error}))),
        ),
      ),
    );
  });

  public throwExportDrawingsRequestError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ExportActions.setExportDrawingsRequestError),
        tap(({error}) => {
          throw new DrawingCouldNotBeExported(error);
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    private readonly exportService: Gb3ExportService,
    private readonly store: Store,
  ) {}
}
