import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {ImportActions} from '../actions/import.actions';
import {Gb3ImportService} from '../../../shared/services/apis/gb3/gb3-import.service';
import {FileValidationError} from '../../../shared/errors/file-upload.errors';

@Injectable()
export class ImportEffects {
  public requestImportDrawings$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ImportActions.requestDrawingsImport),
      switchMap(({file}) =>
        this.importService.importDrawing(file).pipe(
          map(() => ImportActions.setDrawingsImportRequestResponse()),
          catchError((error: unknown) => of(ImportActions.setDrawingsImportRequestError({error}))),
        ),
      ),
    );
  });

  public throwImportDrawingsRequestError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ImportActions.setDrawingsImportRequestError),
        tap(({error}) => {
          throw new FileValidationError(error);
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    private readonly importService: Gb3ImportService,
    private readonly store: Store,
  ) {}
}
