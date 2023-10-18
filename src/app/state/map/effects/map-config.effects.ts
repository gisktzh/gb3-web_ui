import {Inject, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {distinctUntilChanged, filter, switchMap, take, tap} from 'rxjs';
import {MapConfigActions} from '../actions/map-config.actions';
import {MapService} from '../../../map/interfaces/map.service';
import {MAP_SERVICE} from '../../../app.module';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {selectMainPage} from '../../app/reducers/url.reducer';
import {Store} from '@ngrx/store';
import {map} from 'rxjs/operators';
import {routerNavigatedAction} from '@ngrx/router-store';
import {BasemapConfigService} from '../../../map/services/basemap-config.service';
import {selectQueryParams} from '../../app/selectors/router.selector';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {selectMapConfigParams} from '../selectors/map-config-params.selector';
import {UrlActions} from '../../app/actions/url.actions';
import {MapConstants} from '../../../shared/constants/map.constants';

@Injectable()
export class MapConfigEffects {
  public setScaleOnMap$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapConfigActions.setScale),
        tap(({scale}) => this.mapService.setScale(scale)),
      );
    },
    {dispatch: false},
  );

  public resetExtentOnMap$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapConfigActions.resetExtent),
        tap(() => {
          this.mapService.resetExtent();
        }),
      );
    },
    {dispatch: false},
  );

  public changeZoomOnMap$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapConfigActions.changeZoom),
        tap(({zoomType}) => {
          this.mapService.handleZoom(zoomType);
        }),
      );
    },
    {dispatch: false},
  );

  public setCenterOnMap$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapConfigActions.setMapCenter),
        tap(({center}) => {
          this.mapService.setMapCenter(center);
        }),
      );
    },
    {dispatch: false},
  );

  public getInitialMapConfigFromUrl$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(routerNavigatedAction),
      take(1),
      filter((value) => {
        const {x, y, scale, basemap, initialMapIds} = value.payload.routerState.root.queryParams;
        return x || y || scale || basemap || initialMapIds;
      }),
      map((value) => {
        const {x, y, scale, basemap, initialMapIds} = value.payload.routerState.root.queryParams;
        const basemapId = this.basemapConfigService.checkBasemapIdOrGetDefault(basemap);
        const initialMaps = initialMapIds ? initialMapIds.split(',') : [];
        return MapConfigActions.setInitialMapConfig({x, y, scale, basemapId, initialMaps});
      }),
    );
  });

  public removeTemporaryParametersFromUrl$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapConfigActions.setInitialMapConfig),
        concatLatestFrom(() => this.store.select(selectQueryParams)),
        switchMap(([_, params]) => {
          const paramsToRemove = MapConstants.TEMPORARY_URL_PARAMS.reduce((prev, curr) => ({...prev, [curr]: null}), {});
          const adjustedParams: Params = {
            ...params,
            ...paramsToRemove,
          };
          return this.router.navigate([], {
            relativeTo: this.route,
            queryParams: adjustedParams,
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }),
      );
    },
    {dispatch: false},
  );

  public updateQueryParams$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          MapConfigActions.setMapCenter,
          MapConfigActions.setScale,
          MapConfigActions.setBasemap,
          MapConfigActions.setMapExtent,
          UrlActions.setPage,
        ),
        concatLatestFrom(() => [this.store.select(selectMapConfigParams), this.store.select(selectMainPage)]),
        map(([_, params, mainPage]) => {
          return {mainPage, params};
        }),
        distinctUntilChanged(
          (previous, current) =>
            previous.mainPage === current.mainPage &&
            previous.params.x === current.params.x &&
            previous.params.y === current.params.y &&
            previous.params.scale === current.params.scale &&
            previous.params.basemap === current.params.basemap,
        ),
        filter((value) => value.mainPage === MainPage.Maps),
        switchMap((value) => {
          return this.router.navigate([], {
            relativeTo: this.route,
            queryParams: value.params,
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly store: Store,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly basemapConfigService: BasemapConfigService,
  ) {}
}
