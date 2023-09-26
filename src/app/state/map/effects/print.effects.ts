import {Inject, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {filter, of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {PrintActions} from '../actions/print.actions';
import {Gb3PrintService} from '../../../shared/services/apis/gb3/gb3-print.service';
import {DOCUMENT} from '@angular/common';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {PrintUtils} from '../../../shared/utils/print.utils';
import {PrintInfoCouldNotBeLoaded, PrintRequestCouldNotBeHandled} from '../../../shared/errors/print.errors';
import {Store} from '@ngrx/store';
import {selectCapabilities} from '../reducers/print.reducer';

@Injectable()
export class PrintEffects {
  public loadPrintCapabilities$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintActions.loadPrintCapabilities),
      concatLatestFrom(() => [this.store.select(selectCapabilities)]),
      filter(([_, capabilities]) => capabilities === undefined),
      switchMap(() =>
        this.printService.loadPrintCapabilities().pipe(
          map((printInfo) => {
            return PrintActions.setPrintCapabilities({capabilities: printInfo});
          }),
          catchError((error: unknown) => of(PrintActions.setPrintCapabilitiesError({error}))),
        ),
      ),
    );
  });

  public throwPrintCapabilitiesError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(PrintActions.setPrintCapabilitiesError),
        tap(({error}) => {
          throw new PrintInfoCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  public requestPrintCreation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintActions.requestPrintCreation),
      switchMap((value) =>
        this.printService.createPrintJob(value.creation).pipe(
          map((printCreationResponse) => {
            return PrintActions.setPrintCreationResponse({creationResponse: printCreationResponse});
          }),
          catchError((error: unknown) => of(PrintActions.setPrintCreationError({error}))),
        ),
      ),
    );
  });

  public throwPrintCreationError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(PrintActions.setPrintCreationError),
        tap(({error}) => {
          throw new PrintRequestCouldNotBeHandled(error);
        }),
      );
    },
    {dispatch: false},
  );

  public openPrintDocumentInNewTab$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintActions.setPrintCreationResponse),
      map((value) => {
        this.document.defaultView!.window.open(value.creationResponse.reportUrl, '_blank');
        return PrintActions.clearPrintCreation();
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

  constructor(
    private readonly actions$: Actions,
    private readonly printService: Gb3PrintService,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly mapDrawingService: MapDrawingService,
    private readonly store: Store,
  ) {}
}
