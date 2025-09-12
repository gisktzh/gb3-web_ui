import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {filter, of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs';
import {PrintActions} from '../actions/print.actions';
import {Gb3PrintService} from '../../../shared/services/apis/gb3/gb3-print.service';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {PrintUtils} from '../../../shared/utils/print.utils';
import {PrintRequestCouldNotBeHandled} from '../../../shared/errors/print.errors';
import {MapUiActions} from '../actions/map-ui.actions';
import {FileDownloadService} from '../../../shared/services/file-download-service';
import {Store} from '@ngrx/store';
import {selectCapabilitiesValidCombinations} from '../reducers/print.reducer';
import {concatLatestFrom} from '@ngrx/operators';

@Injectable()
export class PrintEffects {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly printService = inject(Gb3PrintService);
  private readonly mapDrawingService = inject(MapDrawingService);
  private readonly fileDownloadService = inject(FileDownloadService);

  public requestPrintCreation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintActions.requestPrintCreation),
      switchMap((value) =>
        this.printService.createPrintJob(value.creation).pipe(
          map((printCreationResponse) => {
            return PrintActions.setPrintRequestResponse({creationResponse: printCreationResponse});
          }),
          catchError((error: unknown) => of(PrintActions.setPrintRequestError({error}))),
        ),
      ),
    );
  });

  public throwPrintRequestError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(PrintActions.setPrintRequestError),
        tap(({error}) => {
          throw new PrintRequestCouldNotBeHandled(error);
        }),
      );
    },
    {dispatch: false},
  );

  public downloadPrintDocument$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintActions.setPrintRequestResponse),
      map((value) => {
        this.extractFileNameFromUrl(value.creationResponse.reportUrl);
        return PrintActions.clearPrintRequest();
      }),
    );
  });

  public startDrawPrintPreview$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(PrintActions.showPrintPreview),
        switchMap(({width, height, scale, rotation}) => {
          const {extentWidth, extentHeight} = PrintUtils.calculateGb2PrintPreviewExtent(width, height, scale);
          return this.mapDrawingService.startDrawPrintPreview(extentWidth, extentHeight, rotation);
        }),
      );
    },
    {dispatch: false},
  );

  public removePrintPreview$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(PrintActions.removePrintPreview),
        tap(() => {
          this.mapDrawingService.stopDrawPrintPreview();
        }),
      );
    },
    {dispatch: false},
  );

  public removePrintPreviewAfterClosingSideDrawer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.hideMapSideDrawerContent),
      map(() => {
        return PrintActions.removePrintPreview();
      }),
    );
  });

  public fetchPrintCapabilitiesCombinations$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintActions.fetchCapabilitiesValidCombinations),
      concatLatestFrom(() => this.store.select(selectCapabilitiesValidCombinations)),
      filter(([_, capabilitiesValidCombinations]) => capabilitiesValidCombinations === undefined),
      switchMap(() => {
        return this.printService.fetchPrintCapabilities().pipe(
          map((data) =>
            PrintActions.capabilitiesValidCombinationsLoaded({
              printCapabilitiesCombinations: data.print?.valid_combinations_machine_readable,
            }),
          ),
        );
      }),
    );
  });

  private extractFileNameFromUrl(url: string): void {
    this.fileDownloadService.downloadFileFromUrl(url, url.split('/').pop());
  }
}
