import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {PrintActions} from '../actions/print.actions';
import {Gb3PrintService} from '../../../shared/services/apis/gb3/gb3-print.service';
import {DOCUMENT} from '@angular/common';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {PrintUtils} from '../../../shared/utils/print.utils';
import {PrintRequestCouldNotBeHandled} from '../../../shared/errors/print.errors';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../actions/map-ui.actions';

@Injectable()
export class PrintEffects {
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

  public openPrintDocumentInNewTab$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintActions.setPrintRequestResponse),
      map((value) => {
        this.document.defaultView!.window.open(value.creationResponse.reportUrl, '_blank');
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

  constructor(
    private readonly actions$: Actions,
    private readonly printService: Gb3PrintService,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly mapDrawingService: MapDrawingService,
    private readonly store: Store,
  ) {}
}
