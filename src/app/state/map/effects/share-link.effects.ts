import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {combineLatestWith, filter, of, switchMap, take, tap} from 'rxjs';
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
import {
  ShareLinkCouldNotBeLoaded,
  ShareLinkCouldNotBeValidated,
  ShareLinkItemCouldNotBeCreated,
} from '../../../shared/errors/share-link.errors';
import {ErrorHandlerService} from '../../../error-handling/error-handler.service';
import {selectLoadedLayerCatalogueAndShareItem} from '../selectors/loaded-layer-catalogue-and-share-item.selector';
import {selectItems} from '../reducers/active-map-item.reducer';

// FIXME WES remove console prints
@Injectable()
export class ShareLinkEffects {
  public loadShareLinkItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.loadItem),
      switchMap((value) =>
        this.shareLinkService.loadShareLink(value.id).pipe(
          map((item) => {
            return ShareLinkActions.setItem({item});
          }),
          catchError((error: unknown) => of(ShareLinkActions.setLoadingError({error}))),
        ),
      ),
    );
  });

  public throwLoadingError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ShareLinkActions.setLoadingError),
        tap(({error}) => {
          throw new ShareLinkCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  public createShareLinkRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.createItem),
      switchMap((value) =>
        this.shareLinkService.createShareLink(value.item).pipe(
          map((id) => {
            return ShareLinkActions.setItemId({id});
          }),
          catchError((error: unknown) => of(ShareLinkActions.setCreationError({error}))),
        ),
      ),
    );
  });

  public throwCreationError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ShareLinkActions.setCreationError),
        tap(({error}) => {
          throw new ShareLinkItemCouldNotBeCreated(error);
        }),
      );
    },
    {dispatch: false},
  );

  public initializeApplicationByLoadingShareLinkItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.initializeApplicationBasedOnId),
      map((value) => {
        return ShareLinkActions.loadItem({id: value.id});
      }),
    );
  });

  public initializeApplicationByLoadingTopics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.initializeApplicationBasedOnId),
      map(() => {
        return LayerCatalogActions.loadLayerCatalog();
      }),
    );
  });

  public initializeApplicationByVerifyingSharedItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.initializeApplicationBasedOnId),
      combineLatestWith(this.store.select(selectLoadedLayerCatalogueAndShareItem)),
      tap(() => console.log('still alive: initializeApplicationByVerifyingSharedItem$')),
      filter(([_, value]) => value !== undefined),
      take(1),
      map(([_, value]) => {
        console.log('initializeApplicationByVerifyingSharedItem$');
        return ShareLinkActions.validateItem({item: value!.shareLinkItem, topics: value!.topics});
      }),
    );
  });

  public validateShareLinkItem = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.validateItem),
      map((value) => {
        // check basemap
        const basemapId = this.basemapConfigService.checkBasemapIdOrGetDefault(value.item.basemapId);
        if (basemapId !== value.item.basemapId) {
          throw new ShareLinkCouldNotBeValidated(`Basemap konnte nicht geladen werden: '${value.item.basemapId}'`);
        }

        // check scale
        let scale = value.item.scale;
        const maxScale = this.configService.mapConfig.mapScaleConfig.maxScale;
        const minScale = this.configService.mapConfig.mapScaleConfig.minScale;
        if (scale > minScale || scale < maxScale) {
          throw new ShareLinkCouldNotBeValidated(`Massstab ist ungültig: '${value.item.scale}'`);
        }

        // check center
        const center = {x: value.item.center.x, y: value.item.center.y};

        // check active map items
        const activeMapItems = this.favouritesService.getActiveMapItemsForFavourite(value.item.content);

        // complete initialization
        return ShareLinkActions.completeValidation({activeMapItems, scale, basemapId, ...center});
      }),
      catchError((error: unknown) => of(ShareLinkActions.setValidationError({error}))),
    );
  });

  public handleValidationError$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.setValidationError),
      switchMap(({error}) => {
        return of(this.errorHandlerService.handleError(error)).pipe(map(() => error));
      }),
      map((error) => {
        return ShareLinkActions.setInitializationError({error});
      }),
    );
  });

  public setMapConfigAfterValidation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.completeValidation),
      map((value) => {
        return MapConfigActions.setInitialMapConfig({
          x: value.x,
          y: value.y,
          scale: value.scale,
          basemapId: value.basemapId,
          initialMaps: [], // active map items are added in a separate effect
        });
      }),
    );
  });

  public setActiveMapItemsAfterValidation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.completeValidation),
      map((value) => {
        return ActiveMapItemActions.prepareActiveMapItems({activeMapItems: value.activeMapItems});
      }),
    );
  });

  public completeInitialization$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.completeValidation),
      combineLatestWith(this.store.select(selectItems)),
      tap(() => console.log('still alive: completeInitialization$')),
      // ensure that the active map items have been set before continuing
      filter(([value, activeMapItems]) => value.activeMapItems.length === activeMapItems.length),
      take(1),
      map(([value, _]) => {
        console.log('completeInitialization$');
        return ShareLinkActions.completeApplicationInitialization();
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
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}
}
