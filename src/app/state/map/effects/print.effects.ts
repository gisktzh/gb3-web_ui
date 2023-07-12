import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {PrintActions} from '../actions/print.actions';
import {Gb3PrintService} from '../../../shared/services/apis/gb3/gb3-print.service';
import {DOCUMENT} from '@angular/common';
import {Store} from '@ngrx/store';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {PrintUtils} from '../../../shared/utils/print.utils';

@Injectable()
export class PrintEffects {
  public dispatchPrintInfoRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintActions.loadPrintInfo),
      switchMap(() =>
        this.printService.loadPrintInfo().pipe(
          map((printInfo) => {
            return PrintActions.setPrintInfo({info: printInfo});
          }),
          catchError(() => EMPTY) // todo error handling
        )
      )
    );
  });

  public dispatchPrintCreationRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintActions.requestPrintCreation),
      switchMap((value) =>
        this.printService.createPrintJob(value.creation).pipe(
          map((printCreationResponse) => {
            return PrintActions.setPrintCreationResponse({creationResponse: printCreationResponse});
          }),
          catchError(() => EMPTY) // todo error handling
        )
      )
    );
  });

  public dispatchPrintCreationResponseRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintActions.setPrintCreationResponse),
      map((value) => {
        this.document.defaultView?.window.open(value.creationResponse.getURL, '_blank');
        return PrintActions.clearPrintCreation();
      })
    );
  });

  public startDrawPrintPreview = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(PrintActions.showPrintPreview),
        tap(({width, height, scale, rotation}) => {
          const {extentWidth, extentHeight} = PrintUtils.calculateGb2PrintPreviewExtent(width, height, scale);
          this.mapDrawingService.startDrawPrintPreview(extentWidth, extentHeight, rotation);
        })
      );
    },
    {dispatch: false}
  );

  public removePrintPreview = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(PrintActions.removePrintPreview),
        tap(() => {
          this.mapDrawingService.stopDrawPrintPreview();
        })
      );
    },
    {dispatch: false}
  );

  constructor(
    private readonly actions$: Actions,
    private readonly printService: Gb3PrintService,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly store: Store,
    private readonly mapDrawingService: MapDrawingService
  ) {}
}
