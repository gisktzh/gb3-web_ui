import {Inject, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {DataDownloadOrderActions} from '../actions/data-download-order.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {filter, of, switchMap, takeWhile, tap, timer} from 'rxjs';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {ConfigService} from '../../../shared/services/config.service';
import {Store} from '@ngrx/store';
import {ToolActions} from '../actions/tool.actions';
import {selectActiveTool} from '../reducers/tool.reducer';
import {GeoshopApiService} from '../../../shared/services/apis/geoshop/services/geoshop-api.service';
import {selectOrder, selectSelection, selectStatusJobs} from '../reducers/data-download-order.reducer';
import {OrderCouldNotBeSent, OrderSelectionIsInvalid, OrderStatusCouldNotBeSent} from '../../../shared/errors/data-download.errors';
import {selectMapSideDrawerContent} from '../reducers/map-ui.reducer';
import {selectProducts} from '../reducers/data-download-product.reducer';

@Injectable()
export class DataDownloadOrderEffects {
  public createOrderFromSelection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadOrderActions.setSelection),
      map(({selection}) => {
        const order = this.geoshopApiService.createOrderFromSelection(selection);
        return DataDownloadOrderActions.setOrder({order});
      }),
      catchError((error: unknown) => of(DataDownloadOrderActions.setSelectionError({error}))),
    );
  });

  public throwSelectionError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadOrderActions.setSelectionError),
        tap(({error}) => {
          throw new OrderSelectionIsInvalid(error);
        }),
      );
    },
    {dispatch: false},
  );

  public zoomToSelection$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapUiActions.showMapSideDrawerContent),
        filter(({mapSideDrawerContent}) => mapSideDrawerContent === 'data-download'),
        concatLatestFrom(() => this.store.select(selectSelection)),
        tap(([_, selection]) => {
          if (selection) {
            this.mapService.zoomToExtent(
              selection.drawingRepresentation.geometry,
              this.configService.mapAnimationConfig.zoom.expandFactor,
              this.configService.mapAnimationConfig.zoom.duration,
            );
          }
        }),
      );
    },
    {dispatch: false},
  );

  public openDataDownloadDrawerAfterSettingOrder$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadOrderActions.setOrder),
      map(() => {
        return MapUiActions.showMapSideDrawerContent({mapSideDrawerContent: 'data-download'});
      }),
    );
  });

  public deactivateToolAfterClearingSelection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadOrderActions.clearSelection, DataDownloadOrderActions.setSelectionError),
      concatLatestFrom(() => this.store.select(selectActiveTool)),
      filter(([_, activeTool]) => activeTool !== undefined),
      map(() => {
        return ToolActions.deactivateTool();
      }),
    );
  });

  public clearSelectionAfterClosingDataDownloadDrawer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.hideMapSideDrawerContent),
      map(() => DataDownloadOrderActions.clearSelection()),
    );
  });

  public clearGeometryFromMap$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadOrderActions.clearSelection, DataDownloadOrderActions.setSelectionError),
        tap(() => {
          this.mapDrawingService.clearDataDownloadSelection();
        }),
      );
    },
    {dispatch: false},
  );

  public sendOrder$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadOrderActions.sendOrder),
      concatLatestFrom(() => [this.store.select(selectOrder)]),
      filter(([_, order]) => order !== undefined),
      map(([_, order]) => order!),
      switchMap((order) =>
        this.geoshopApiService.sendOrder(order).pipe(
          map((orderResponse) => {
            return DataDownloadOrderActions.setSendOrderResponse({order, orderResponse});
          }),
          catchError((error: unknown) => of(DataDownloadOrderActions.setSendOrderError({error}))),
        ),
      ),
    );
  });

  public throwSendOrderError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadOrderActions.setSendOrderError),
        tap(({error}) => {
          throw new OrderCouldNotBeSent(error);
        }),
      );
    },
    {dispatch: false},
  );

  public closeDataDownloadDrawerAfterSendingAnOrderSuccessfully$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadOrderActions.setSendOrderResponse),
      concatLatestFrom(() => [this.store.select(selectMapSideDrawerContent)]),
      filter(([_, mapSideDrawerContent]) => mapSideDrawerContent === 'data-download'),
      map(() => {
        return MapUiActions.hideMapSideDrawerContent();
      }),
    );
  });

  public showEmailConfirmationDialogAfterSendingAnOrderWithEmailSuccessfully$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadOrderActions.setSendOrderResponse),
      filter(({order}) => !!order.email),
      map(() => {
        return MapUiActions.showDataDownloadEmailConfirmationDialog();
      }),
    );
  });

  public requestOrderStatusAfterSendingAnOrderWithoutEmailSuccessfully$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadOrderActions.setSendOrderResponse),
      filter(({order}) => !order.email),
      concatLatestFrom(() => this.store.select(selectProducts)),
      map(([{order, orderResponse}, products]) => {
        const orderTitle = this.geoshopApiService.createOrderTitle(order, products);
        return DataDownloadOrderActions.requestOrderStatus({orderId: orderResponse.orderId, orderTitle});
      }),
    );
  });

  public throwOrderStatusError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadOrderActions.setOrderStatusError),
        tap(({error}) => {
          throw new OrderStatusCouldNotBeSent(error);
        }),
      );
    },
    {dispatch: false},
  );

  public periodicallyCheckOrderStatus$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadOrderActions.requestOrderStatus),
      mergeMap(({orderId}) =>
        timer(this.configService.dataDownloadConfig.initialPollingDelay, this.configService.dataDownloadConfig.pollingInterval).pipe(
          concatLatestFrom(() => [this.store.select(selectStatusJobs)]),
          takeWhile(([_, statusJobs]) => {
            const statusJob = statusJobs.find((activeStatusJob) => activeStatusJob.id === orderId);
            // Status job termination criteria:
            //  - a status job finishes either with status type 'success' or 'failure'
            //  - circuit breaker: too many failed request in a row will cancel the job
            const continuePollingStatusJob =
              !statusJob ||
              (statusJob.consecutiveErrorsCount < this.configService.dataDownloadConfig.maximumNumberOfConsecutiveStatusJobErrors &&
                statusJob.status?.status.type !== 'success' &&
                statusJob.status?.status.type !== 'failure');
            return continuePollingStatusJob;
          }),
          switchMap(() =>
            this.geoshopApiService.checkOrderStatus(orderId).pipe(
              map((orderStatus) => {
                return DataDownloadOrderActions.setOrderStatusResponse({orderStatus});
              }),
              catchError((error: unknown) => of(DataDownloadOrderActions.setOrderStatusError({error, orderId}))),
            ),
          ),
        ),
      ),
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly mapDrawingService: MapDrawingService,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly configService: ConfigService,
    private readonly store: Store,
    private readonly geoshopApiService: GeoshopApiService,
  ) {}
}
