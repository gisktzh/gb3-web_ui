import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {UrlActions} from '../actions/url.actions';
import {map} from 'rxjs/operators';
import {routerCancelAction, routerNavigatedAction} from '@ngrx/router-store';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {UrlUtils} from '../../../shared/utils/url.utils';
import {ConfigService} from '../../../shared/services/config.service';
import {distinctUntilChanged, filter, switchMap} from 'rxjs';
import {MapConfigActions} from '../../map/actions/map-config.actions';
import {MapConstants} from '../../../shared/constants/map.constants';
import {selectMapConfigParams} from '../../map/selectors/map-config-params.selector';
import {selectMainPage} from '../reducers/url.reducer';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {Store} from '@ngrx/store';
import {BasemapConfigService} from '../../../map/services/basemap-config.service';
import {selectQueryParams} from '../selectors/router.selector';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';
import {SearchActions} from '../actions/search.actions';
import {InitialMapExtentService} from '../../../map/services/initial-map-extent.service';

@Injectable()
export class UrlEffects {
  public extractMainPageFromUrl$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(routerNavigatedAction, routerCancelAction),
      map((value) => {
        const urlTree = this.router.parseUrl(value.payload.routerState.url);
        const urlSegments = UrlUtils.extractUrlSegments(urlTree);
        const firstUrlSegmentPath = UrlUtils.extractFirstUrlSegmentPath(urlSegments);
        const mainPage = UrlUtils.transformStringToMainPage(firstUrlSegmentPath);
        const isSimplifiedPage = mainPage !== undefined && this.configService.pageConfig.useSimplifiedPageOn.includes(mainPage);
        const segmentPaths: string[] = urlSegments.map((segment) => segment.path);
        const isHeadlessPage = this.configService.pageConfig.useHeadlessPageOn.some((headlessPagePaths) =>
          UrlUtils.containsSegmentPaths([headlessPagePaths], segmentPaths),
        );

        return UrlActions.setPage({mainPage, isSimplifiedPage, isHeadlessPage});
      }),
    );
  });

  public setAppParameters$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UrlActions.setPage),
      concatLatestFrom(() => [this.store.select(selectQueryParams)]),
      map(([_, params]) => {
        return UrlActions.setAppParams({params});
      }),
    );
  });

  public removeTemporaryAppParameters$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UrlActions.setAppParams),
        map(({params}) => {
          let adjustedParams: Params | undefined = undefined;
          if (Object.keys(params).some((paramKey) => RouteParamConstants.GLOBAL_TEMPORARY_URL_PARAMS.includes(paramKey))) {
            // set temporary parameters to `null`
            adjustedParams = RouteParamConstants.GLOBAL_TEMPORARY_URL_PARAMS.reduce((prev, curr) => ({...prev, [curr]: null}), {});
          }
          return adjustedParams;
        }),
        filter((adjustedParams): adjustedParams is Params => !!adjustedParams && Object.keys(adjustedParams).length > 0),
        switchMap((adjustedParams) => {
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

  public handleInitialMapPageParameters$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UrlActions.setPage),
      map((action) => action.mainPage),
      distinctUntilChanged(),
      filter((mainPage) => mainPage === MainPage.Maps),
      concatLatestFrom(() => [this.store.select(selectQueryParams), this.store.select(selectMapConfigParams)]),
      map(([_, currentParams, mapConfigParams]) => {
        const {x, y, scale, basemap, initialMapIds, searchTerm, searchIndex} = UrlUtils.extractUrlParamsForMapInitialization(currentParams);
        const basemapId = this.basemapConfigService.checkBasemapIdOrGetDefault(basemap);
        const initialMaps = initialMapIds ? initialMapIds.split(',') : [];
        if (searchTerm || searchIndex) {
          return SearchActions.initializeSearchFromUrlParameters({
            searchTerm: searchTerm,
            searchIndex: searchIndex ? searchIndex.split(',')[0] : undefined,
            basemapId,
            initialMaps,
          });
        } else if (x || y || scale || basemap || initialMapIds) {
          if (!x && !y && !scale) {
            const initialExtent = this.initalMapExtentService.calculateInitialExtent();
            return MapConfigActions.setInitialMapConfig({...initialExtent, initialMaps, basemapId});
          }
          return MapConfigActions.setInitialMapConfig({x, y, scale, basemapId, initialMaps});
        } else {
          return UrlActions.setMapPageParams({params: mapConfigParams});
        }
      }),
    );
  });

  public setMapPageParameters$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(UrlActions.setMapPageParams),
        concatLatestFrom(() => [this.store.select(selectQueryParams), this.store.select(selectMainPage)]),
        filter(([, , mainPage]) => mainPage === MainPage.Maps),
        map(([{params}, currentParams, _]) => {
          let adjustedAndCurrentParams: {params: Params; currentParams: Params} = {params, currentParams};
          if (Object.keys(currentParams).some((paramKey) => MapConstants.TEMPORARY_URL_PARAMS.includes(paramKey))) {
            // remove temporary parameters
            const paramsToRemove = MapConstants.TEMPORARY_URL_PARAMS.reduce((prev, curr) => ({...prev, [curr]: null}), {});
            const adjustedParams: Params = {
              ...params,
              ...paramsToRemove,
            };
            adjustedAndCurrentParams = {params: adjustedParams, currentParams};
          }
          return adjustedAndCurrentParams;
        }),
        filter(({params, currentParams}) => !UrlUtils.areParamsEqual(params, currentParams)),
        switchMap(({params}) => {
          return this.router.navigate([], {
            relativeTo: this.route,
            queryParams: params,
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
    private readonly router: Router,
    private readonly configService: ConfigService,
    private readonly store: Store,
    private readonly route: ActivatedRoute,
    private readonly basemapConfigService: BasemapConfigService,
    private readonly initalMapExtentService: InitialMapExtentService,
  ) {}
}
