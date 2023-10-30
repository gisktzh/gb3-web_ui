import {Inject, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {filter, of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Gb3PrintService} from '../../../shared/services/apis/gb3/gb3-print.service';
import {DOCUMENT} from '@angular/common';
import {PrintRequestCouldNotBeHandled} from '../../../shared/errors/print.errors';
import {Store} from '@ngrx/store';
import {OverlayPrintActions} from '../actions/overlay-print-actions';
import {selectPrintLegendItems} from '../selectors/print-legend-items.selector';

@Injectable()
export class OverlayPrintEffects {
  public requestPrint$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OverlayPrintActions.print),
      filter((v) => v.overlay === 'legend'),
      concatLatestFrom(() => this.store.select(selectPrintLegendItems)),
      switchMap(([_, items]) =>
        this.printService.printLegend(items).pipe(
          map((printCreationResponse) => {
            return OverlayPrintActions.setPrintRequestResponse({overlay: 'legend', creationResponse: printCreationResponse});
          }),
          catchError((error: unknown) => of(OverlayPrintActions.setPrintRequestError({overlay: 'legend', error}))),
        ),
      ),
    );
  });

  public openPrintDocumentInNewTab$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(OverlayPrintActions.setPrintRequestResponse),
        tap((value) => {
          this.document.defaultView!.window.open(value.creationResponse.reportUrl, '_blank');
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
