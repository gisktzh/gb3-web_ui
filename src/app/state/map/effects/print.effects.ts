import {Inject, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {PrintActions} from '../actions/print.actions';
import {Gb3PrintService} from '../../../shared/services/apis/gb3/gb3-print.service';
import {DOCUMENT} from '@angular/common';
import {MapConstants} from '../../../shared/constants/map.constants';
import {Store} from '@ngrx/store';
import {selectMapConfigState} from '../reducers/map-config.reducer';
import {MapDrawingService} from '../../../map/services/map-drawing.service';

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

  public drawPrintPreview = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(PrintActions.showPrintPreview),
        concatLatestFrom(() => this.store.select(selectMapConfigState)),
        tap(([{layout}, mapConfigState]) => {
          const resolution = layout.scale / 72 / MapConstants.INCHES_PER_UNIT.m;
          const printExtentWidth = (layout.width * resolution) / 2; // m
          const printExtentHeight = (layout.height * resolution) / 2; // m
          console.log('showPrintPreview effect');
          this.mapDrawingService.drawPrintPreview(printExtentWidth, printExtentHeight, 0);
          // const geometryWithSrs: PolygonWithSrs = {
          //   srs: MapConstants.DEFAULT_SRS,
          //   type: 'Polygon',
          //   coordinates: [[
          //     [mapConfigState.center.x - printExtentWidth, mapConfigState.center.y - printExtentHeight],
          //     [mapConfigState.center.x - printExtentWidth, mapConfigState.center.y + printExtentHeight],
          //     [mapConfigState.center.x + printExtentWidth, mapConfigState.center.y + printExtentHeight],
          //     [mapConfigState.center.x + printExtentWidth, mapConfigState.center.y - printExtentHeight]
          //   ]]};
          // this.mapDrawingService.drawPrintPreview(geometryWithSrs);
        })
      );
    },
    {dispatch: false}
  );

  public clearPrintPreview = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(PrintActions.clearPrintPreview),
        tap(() => {
          // this.mapDrawingService.clearPrintPreview();
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
