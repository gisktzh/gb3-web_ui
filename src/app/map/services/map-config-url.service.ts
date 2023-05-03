import {Injectable, OnDestroy} from '@angular/core';
import {ActivatedRoute, Params, QueryParamsHandling, Router} from '@angular/router';
import {first, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MapConfigActions} from '../../state/map/actions/map-config.actions';
import {selectMapConfigState} from '../../state/map/reducers/map-config.reducer';
import {PrintType} from '../../shared/types/print-type';
import {BasemapConfigService} from './basemap-config.service';
import {MapConfigState} from '../../state/map/states/map-config.state';

/**
 * Query params that are removed upon loading the initial map configuration.
 */
const TEMPORARY_URL_PARAMS = ['initialMapIds'];

@Injectable()
export class MapConfigUrlService implements OnDestroy {
  private readonly mapConfig$ = this.store.select(selectMapConfigState);
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly basemapConfigService: BasemapConfigService
  ) {
    this.getInitialMapConfig();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public async activatePrintMode(printType: PrintType) {
    const queryParams = {print: printType};
    await this.updateQueryParams(queryParams, 'merge');
  }

  public async deactivatePrintMode() {
    const {print, ...otherParams} = this.route.snapshot.queryParams;
    await this.updateQueryParams(otherParams);
  }

  private getInitialMapConfig() {
    this.subscriptions.add(
      this.route.queryParams
        .pipe(
          first(),
          tap(async (queryParams) => {
            this.extractMapParameters(queryParams);
            await this.removeTemporaryQueryParams(queryParams);
            this.subscribeToUrlChanges();
          })
        )
        .subscribe()
    );
  }

  private extractMapParameters(params: Params) {
    const {x, y, scale, basemap, initialMapIds} = params;
    if (x || y || scale || basemap || initialMapIds) {
      const basemapId = this.basemapConfigService.checkBasemapIdOrGetDefault(basemap);
      const initialMaps = this.getInitialMapsForDisplayOrDefault(initialMapIds);
      this.store.dispatch(MapConfigActions.setInitialMapConfig({x, y, scale, basemapId, initialMaps}));
    }
  }

  private subscribeToUrlChanges() {
    this.subscriptions.add(
      this.mapConfig$
        .pipe(
          tap(async (mapConfig) => {
            const {center, scale} = this.getRoundedMapParameters(mapConfig);
            const {activeBasemapId} = mapConfig;
            const queryParams: Params = {x: center.x, y: center.y, scale: scale, basemap: activeBasemapId};
            await this.updateQueryParams(queryParams, 'merge');
          })
        )
        .subscribe()
    );
  }

  private getRoundedMapParameters(config: MapConfigState): Pick<MapConfigState, 'center' | 'scale'> {
    return {
      center: {
        x: Math.round(config.center.x),
        y: Math.round(config.center.y)
      },
      scale: Math.round(config.scale)
    };
  }

  private getInitialMapsForDisplayOrDefault(initialMapIds: string | undefined): string[] {
    return initialMapIds ? initialMapIds.split(',') : [];
  }

  private async removeTemporaryQueryParams(params: Params) {
    const paramsToRemove = TEMPORARY_URL_PARAMS.reduce((prev, curr) => ({...prev, [curr]: null}), {});
    const adjustedParams: Params = {
      ...params,
      ...paramsToRemove
    };

    await this.updateQueryParams(adjustedParams, 'merge');
  }

  private async updateQueryParams(queryParams: Params, queryParamsHandling: QueryParamsHandling | null = null) {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling
    });
  }
}
