import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {filter, of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs';
import {Gb3PrintService} from '../../../shared/services/apis/gb3/gb3-print.service';
import {PrintRequestCouldNotBeHandled} from '../../../shared/errors/print.errors';
import {Store} from '@ngrx/store';
import {OverlayPrintActions} from '../actions/overlay-print-actions';
import {selectPrintLegendItems} from '../selectors/print-legend-items.selector';
import {selectPrintFeatureInfoItems} from '../selectors/print-feature-info-items.selector';
import {FileDownloadService} from '../../../shared/services/file-download-service';
import {PrintActions} from '../actions/print.actions';

@Injectable()
export class OverlayPrintEffects {
  private readonly actions$ = inject(Actions);
  private readonly printService = inject(Gb3PrintService);
  private readonly fileDownloadService = inject(FileDownloadService);
  private readonly store = inject(Store);

  public requestLegendPrint$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OverlayPrintActions.sendPrintRequest),
      filter((action) => action.overlay === 'legend'),
      concatLatestFrom(() => this.store.select(selectPrintLegendItems)),
      switchMap(([{overlay}, items]) =>
        this.printService.printLegend(items).pipe(
          map((printCreationResponse) => {
            return OverlayPrintActions.setPrintRequestResponse({overlay, creationResponse: printCreationResponse});
          }),
          catchError((error: unknown) => of(OverlayPrintActions.setPrintRequestError({overlay, error}))),
        ),
      ),
    );
  });

  public requestFeatureInfoPrint$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OverlayPrintActions.sendPrintRequest),
      filter((action) => action.overlay === 'featureInfo'),
      concatLatestFrom(() => this.store.select(selectPrintFeatureInfoItems)),
      filter(([_, {x, y}]) => x !== undefined && y !== undefined),
      switchMap(([{overlay}, {x, y, items}]) =>
        this.printService.printFeatureInfo(items, x!, y!).pipe(
          map((printCreationResponse) => {
            return OverlayPrintActions.setPrintRequestResponse({overlay, creationResponse: printCreationResponse});
          }),
          catchError((error: unknown) => of(OverlayPrintActions.setPrintRequestError({overlay, error}))),
        ),
      ),
    );
  });

  public downloadPrintDocument$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(OverlayPrintActions.setPrintRequestResponse),
        tap((value) => {
          this.extractFileNameFromUrl(value.creationResponse.reportUrl);
          return PrintActions.clearPrintRequest();
        }),
      );
    },
    {dispatch: false},
  );

  public throwPrintRequestError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(OverlayPrintActions.setPrintRequestError),
        tap(({error}) => {
          throw new PrintRequestCouldNotBeHandled(error);
        }),
      );
    },
    {dispatch: false},
  );

  private extractFileNameFromUrl(url: string): void {
    this.fileDownloadService.downloadFileFromUrl(url, url.split('/').pop());
  }
}
