import {Injectable, OnDestroy} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {first, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MapConfigActions} from '../../state/map/actions/map-config.actions';
import {MapConfigState, selectMapConfigState} from '../../state/map/reducers/map-config.reducer';
import {PrintType} from '../../shared/types/print-type';
import {BasemapConfigService} from './basemap-config.service';

@Injectable()
export class MapConfigUrlService implements OnDestroy {
  private readonly mapConfig$ = this.store.select(selectMapConfigState);
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly basemapConfiService: BasemapConfigService
  ) {
    this.getInitialMapConfig();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public activatePrintMode(printType: PrintType) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {print: printType},
      queryParamsHandling: 'merge'
    });
  }

  public deactivatePrintMode() {
    const {print, ...otherParams} = this.route.snapshot.queryParams;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: otherParams
    });
  }

  private getInitialMapConfig() {
    this.subscriptions.add(
      this.route.queryParams
        .pipe(
          first(),
          tap((params) => {
            this.extractMapParameters(params);
            this.subscribeToUrlChanges();
          })
        )
        .subscribe()
    );
  }

  private extractMapParameters(params: Params) {
    const {x, y, scale, basemap} = params;
    if (x || y || scale || basemap) {
      const basemapId = this.basemapConfiService.checkBasemapIdOrGetDefault(basemap);
      this.store.dispatch(MapConfigActions.setInitialMapConfig({x, y, scale, basemapId}));
    }
  }

  private subscribeToUrlChanges() {
    this.subscriptions.add(
      this.mapConfig$
        .pipe(
          tap(async (config) => {
            const {center, scale} = this.getRoundedMapParameters(config);
            const {activeBasemapId} = config;
            const queryParms: Params = {x: center.x, y: center.y, scale: scale, basemap: activeBasemapId};
            await this.router.navigate([], {
              relativeTo: this.route,
              queryParams: queryParms,
              queryParamsHandling: 'merge'
            });
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
}
