import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {DOCUMENT} from '@angular/common';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {PrintRequestCouldNotBeHandled} from '../../../shared/errors/print.errors';
import {Store} from '@ngrx/store';
import {ExportActions} from '../actions/export.actions';
import {Gb3ExportService} from '../../../shared/services/apis/gb3/gb3-export.service';
import {selectUserDrawingsVectorLayers} from '../selectors/user-drawings-vector-layers.selector';
import {concatLatestFrom} from '@ngrx/operators';

@Injectable()
export class ExportEffects {
  public requestExportDrawings$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExportActions.requestExportDrawings),
      concatLatestFrom(() => this.store.select(selectUserDrawingsVectorLayers)),
      switchMap(([{exportFormat}, drawings]) =>
        this.exportService.exportDrawing(exportFormat, drawings.drawings).pipe(
          map((exportDrawingsResponse) => {
            return ExportActions.setExportDrawingsRequestResponse();
          }),
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
          throw new PrintRequestCouldNotBeHandled(error);
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    private readonly exportService: Gb3ExportService,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly mapDrawingService: MapDrawingService,
    private readonly store: Store,
  ) {}
}
