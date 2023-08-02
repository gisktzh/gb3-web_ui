import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, switchMap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ShareLinkActions} from '../actions/share-link.actions';
import {Gb3ShareLinkService} from '../../../shared/services/apis/gb3/gb3-share-link.service';
import {Store} from '@ngrx/store';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {BasemapConfigService} from '../../../map/services/basemap-config.service';
import {ConfigService} from '../../../shared/services/config.service';
import {FavouritesService} from '../../../map/services/favourites.service';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {Router} from '@angular/router';
import {MapConfigActions} from '../actions/map-config.actions';

@Injectable()
export class ShareLinkEffects {
  public loadShareLinkItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.loadShareLinkItem),
      switchMap((value) =>
        this.shareLinkService.loadShareLink(value.id).pipe(
          map((item) => {
            return ShareLinkActions.setShareLinkItem({item});
          }),
          catchError(() => EMPTY), // todo error handling
        ),
      ),
    );
  });

  public createShareLinkRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.createShareLinkItem),
      switchMap((value) =>
        this.shareLinkService.createShareLink(value.item).pipe(
          map((id) => {
            return ShareLinkActions.setShareLinkId({id});
          }),
          catchError(() => EMPTY), // todo error handling
        ),
      ),
    );
  });

  public initializeApplicationByLoadingShareLinkItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.initializeApplicationBasedOnShareLinkId),
      map((value) => {
        return ShareLinkActions.loadShareLinkItem({id: value.id});
      }),
    );
  });

  public initializeApplicationByLoadingTopics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.initializeApplicationBasedOnShareLinkId),
      map(() => {
        return LayerCatalogActions.loadLayerCatalog();
      }),
    );
  });

  public validateShareLinkItem = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.validateApplicationInitialization),
      map((value) => {
        const errors: string[] = [];

        // check basemap
        const basemapId = this.basemapConfigService.checkBasemapIdOrGetDefault(value.item.basemapId);
        if (basemapId !== value.item.basemapId) {
          errors.push(`Basemap konnte nicht geladen werden: '${value.item.basemapId}'`);
        }

        // check scale
        let scale = value.item.scale;
        const maxScale = this.configService.mapConfig.mapScaleConfig.maxScale;
        const minScale = this.configService.mapConfig.mapScaleConfig.minScale;
        if (scale > minScale || scale < maxScale) {
          errors.push(`Massstab ist ungültig: '${value.item.scale}'`);
          scale = this.configService.mapConfig.defaultMapConfig.scale;
        }

        // check center
        const center = {x: value.item.center.x, y: value.item.center.y};

        // check active map items
        const activeMapItems = this.favouritesService.getActiveMapItemsForFavourite(value.item.content);

        // complete initialization
        return ShareLinkActions.completeApplicationInitialization({errors, activeMapItems, scale, basemapId, ...center});
      }),
    );
  });

  public completeApplicationInitializationInMapConfig$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.completeApplicationInitialization),
      map((value) => {
        return MapConfigActions.setInitialMapConfig({
          x: value.x,
          y: value.y,
          scale: value.scale,
          basemapId: value.basemapId,
          initialMaps: [],
        });
      }),
    );
  });

  public completeApplicationInitializationInActiveMapItems$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.completeApplicationInitialization),
      map((value) => {
        return ActiveMapItemActions.setActiveMapItems({activeMapItems: value.activeMapItems});
      }),
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly shareLinkService: Gb3ShareLinkService,
    private readonly store: Store,
    private readonly basemapConfigService: BasemapConfigService,
    private readonly configService: ConfigService,
    private readonly favouritesService: FavouritesService,
    private readonly router: Router,
  ) {}
}
