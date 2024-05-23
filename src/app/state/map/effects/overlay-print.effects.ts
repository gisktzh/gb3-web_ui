import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {filter, of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Gb3PrintService} from '../../../shared/services/apis/gb3/gb3-print.service';
import {DOCUMENT} from '@angular/common';
import {PrintRequestCouldNotBeHandled} from '../../../shared/errors/print.errors';
import {Store} from '@ngrx/store';
import {OverlayPrintActions} from '../actions/overlay-print-actions';
import {selectPrintLegendItems} from '../selectors/print-legend-items.selector';
import {selectPrintFeatureInfoItems} from '../selectors/print-feature-info-items.selector';
import {saveAs} from 'file-saver';

@Injectable()
export class OverlayPrintEffects {
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
          saveAs(value.creationResponse.reportUrl, value.creationResponse.reportUrl.split('/').pop());
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

  constructor(
    private readonly actions$: Actions,
    private readonly printService: Gb3PrintService,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly store: Store,
  ) {}
}
