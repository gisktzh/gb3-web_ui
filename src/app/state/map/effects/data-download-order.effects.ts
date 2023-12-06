import {ErrorHandler, Inject, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {catchError, map} from 'rxjs/operators';
import {DataDownloadOrderActions} from '../actions/data-download-order.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {filter, of, switchMap, tap} from 'rxjs';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {ConfigService} from '../../../shared/services/config.service';
import {Store} from '@ngrx/store';
import {ToolActions} from '../actions/tool.actions';
import {selectActiveTool} from '../reducers/tool.reducer';
import {GeoshopApiService} from '../../../shared/services/apis/geoshop/services/geoshop-api.service';
import {selectOrder, selectSelection} from '../reducers/data-download-order.reducer';
import {OrderCouldNotBeSent, OrderSelectionIsInvalid, OrderUnsupportedGeometry} from '../../../shared/errors/data-download.errors';
import {selectMapSideDrawerContent} from '../reducers/map-ui.reducer';
import {selectProducts} from '../reducers/data-download-product.reducer';
import {HttpErrorResponse} from '@angular/common/http';
import {Order} from '../../../shared/interfaces/geoshop-order.interface';
import {DataDownloadOrderStatusJobActions} from '../actions/data-download-order-status-job.actions';

@Injectable()
export class DataDownloadOrderEffects {
  public createOrderFromSelection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadOrderActions.setSelection),
      map(({selection}) => {
        try {
          const order = this.geoshopApiService.createOrderFromSelection(selection);
          return DataDownloadOrderActions.setOrder({order});
        } catch (error: unknown) {
          return DataDownloadOrderActions.setSelectionError({error});
        }
      }),
    );
  });

  public handleSelectionError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadOrderActions.setSelectionError),
        tap(({error}) => {
          // TODO GB3-914: Replace with `throwError` again after implementing a effect error handler
          if (error instanceof OrderUnsupportedGeometry) {
            this.errorHandler.handleError(error);
          } else {
            this.errorHandler.handleError(new OrderSelectionIsInvalid(error));
          }
        }),
      );
    },
    {dispatch: false},
  );

  public clearSelectionAfterError$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadOrderActions.setSelectionError),
      map(() => DataDownloadOrderActions.clearSelection()),
    );
  });

  public zoomToSelection$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapUiActions.notifyMapSideDrawerAfterOpen),
        concatLatestFrom(() => this.store.select(selectMapSideDrawerContent)),
        filter(([_, mapSideDrawerContent]) => mapSideDrawerContent === 'data-download'),
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
      ofType(DataDownloadOrderActions.clearSelection),
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
        ofType(DataDownloadOrderActions.clearSelection),
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
      map(([_, order]) => order),
      filter((order): order is Order => order !== undefined),
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

  public handleSendOrderError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadOrderActions.setSendOrderError),
        tap(({error}) => {
          let message = undefined;
          if (error instanceof HttpErrorResponse && !!error.statusText) {
            message = error.statusText;
          }
          // TODO GB3-914: Replace with `throwError` again after implementing a effect error handler
          this.errorHandler.handleError(new OrderCouldNotBeSent(error, message));
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
        return DataDownloadOrderStatusJobActions.requestOrderStatus({orderId: orderResponse.orderId, orderTitle});
      }),
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly mapDrawingService: MapDrawingService,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly configService: ConfigService,
    private readonly store: Store,
    private readonly geoshopApiService: GeoshopApiService,
    private readonly errorHandler: ErrorHandler,
  ) {}
}
