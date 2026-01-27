import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs';
import {Store} from '@ngrx/store';
import {ExportActions} from '../actions/export.actions';
import {Gb3ExportService} from '../../../shared/services/apis/gb3/gb3-export.service';
import {selectUserDrawingsVectorLayers} from '../selectors/user-drawings-vector-layers.selector';
import {concatLatestFrom} from '@ngrx/operators';
import {DrawingCouldNotBeExported} from '../../../shared/errors/export.errors';
import {SymbolizationToGb3ConverterUtils} from 'src/app/shared/utils/symbolization-to-gb3-converter.utils';

@Injectable()
export class ExportEffects {
  private readonly actions$ = inject(Actions);
  private readonly exportService = inject(Gb3ExportService);
  private readonly store = inject(Store);
  private readonly symbolizationToGb3ConverterUtils = inject(SymbolizationToGb3ConverterUtils);

  public requestExportDrawings$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExportActions.requestDrawingsExport),
      concatLatestFrom(() => this.store.select(selectUserDrawingsVectorLayers)),
      switchMap(([{exportFormat}, drawings]) =>
        this.exportService
          .exportDrawing(exportFormat, this.symbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation(drawings.drawings))
          .pipe(
            map(() => ExportActions.setDrawingsExportRequestResponse()),
            catchError((error: unknown) => of(ExportActions.setDrawingsExportRequestError({error}))),
          ),
      ),
    );
  });

  public resetStateAfterSuccessfulRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExportActions.setDrawingsExportRequestResponse),
      map(() => ExportActions.resetDrawingsExportRequest()),
    );
  });

  public throwExportDrawingsRequestError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ExportActions.setDrawingsExportRequestError),
        tap(({error}) => {
          throw new DrawingCouldNotBeExported(error);
        }),
      );
    },
    {dispatch: false},
  );
}
