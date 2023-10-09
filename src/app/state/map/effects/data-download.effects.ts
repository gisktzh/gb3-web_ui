import {Inject, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {catchError, map} from 'rxjs/operators';
import {DataDownloadActions} from '../actions/data-download.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {filter, of, switchMap, tap} from 'rxjs';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {ConfigService} from '../../../shared/services/config.service';
import {Store} from '@ngrx/store';
import {selectProducts} from '../reducers/data-download.reducer';
import {GeoshopApiService} from '../../../shared/services/apis/geoshop/services/geoshop-api.service';
import {ProductsCouldNotBeLoaded} from '../../../shared/errors/data-download.errors';

@Injectable()
export class DataDownloadEffects {
  public openDataDownloadDrawerAfterCompletingSelection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadActions.setSelection),
      map(({selection}) => {
        this.mapService.zoomToExtent(
          selection.drawingRepresentation.geometry,
          this.configService.mapAnimationConfig.zoom.expandFactor,
          this.configService.mapAnimationConfig.zoom.duration,
        );
        return MapUiActions.showMapSideDrawerContent({mapSideDrawerContent: 'data-download'});
      }),
    );
  });

  public clearSelectionAfterClosingDataDownloadDrawer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.hideMapSideDrawerContent),
      map(() => DataDownloadActions.clearSelection()),
    );
  });

  public clearGeometryFromMap$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadActions.clearSelection),
        tap(() => {
          this.mapDrawingService.clearDataDownloadSelection();
        }),
      );
    },
    {dispatch: false},
  );

  public loadProducts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadActions.loadProducts),
      concatLatestFrom(() => [this.store.select(selectProducts)]),
      filter(([_, products]) => products === undefined),
      switchMap(() =>
        this.geoshopApiService.loadProducts().pipe(
          map((products) => {
            return DataDownloadActions.setProducts({products});
          }),
          catchError((error: unknown) => of(DataDownloadActions.setProductsError({error}))),
        ),
      ),
    );
  });

  public throwProductsError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadActions.setProductsError),
        tap(({error}) => {
          throw new ProductsCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    private readonly mapDrawingService: MapDrawingService,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly configService: ConfigService,
    private readonly store: Store,
    private readonly geoshopApiService: GeoshopApiService,
  ) {}
}
