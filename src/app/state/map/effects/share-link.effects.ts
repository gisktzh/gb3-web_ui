import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {combineLatestWith, filter, of, switchMap, take, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ShareLinkActions} from '../actions/share-link.actions';
import {Gb3ShareLinkService} from '../../../shared/services/apis/gb3/gb3-share-link.service';
import {Store} from '@ngrx/store';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {
  ShareLinkCouldNotBeLoaded,
  ShareLinkCouldNotBeValidated,
  ShareLinkItemCouldNotBeCreated,
} from '../../../shared/errors/share-link.errors';
import {selectLoadedLayerCatalogueAndShareItem} from '../selectors/loaded-layer-catalogue-and-share-item.selector';
import {selectItems} from '../selectors/active-map-items.selector';
import {DrawingActions} from '../actions/drawing.actions';
import {selectDrawings} from '../reducers/drawing.reducer';
import {selectIsAuthenticated, selectIsInitialDataLoaded} from '../../auth/reducers/auth-status.reducer';

/**
 * This class contains a bunch of effects. Most of them are straightforward: do something asynchronous and return a new action afterward or
 * go to an error state.
 *
 * Initialize application based on a given ID
 * However, there is the whole `initializeApplication` and `validation` part where this application gets initialized based on a
 * previously shared link ID. The whole section is basically a big state machine. In the README.md is a more detailed explanation of the
 * basic logic flow (see 'Application Initialization based on share link')
 */
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

  public waitForAuthenticationStatusToBeLoaded$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.initializeApplicationBasedOnId),
      // we use `combineLatestWith` here to wait for the authentication service to finish its initialization (and change to `true`)
      combineLatestWith(
        this.store.select(selectIsInitialDataLoaded).pipe(
          filter((isAuthenticationInitialized) => isAuthenticationInitialized === true),
          take(1),
        ),
      ),
      map(([{id}, _]) => {
        return ShareLinkActions.authenticationInitialized({id});
      }),
    );
  });

  public initializeApplicationByLoadingShareLinkItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.authenticationInitialized),
      map((value) => {
        return ShareLinkActions.loadItem({id: value.id});
      }),
    );
  });

  public initializeApplicationByLoadingTopics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.authenticationInitialized),
      map(() => {
        return LayerCatalogActions.loadLayerCatalog();
      }),
    );
  });

  public initializeApplicationByVerifyingSharedItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.authenticationInitialized),
      // we can't use `concatLatestFrom` here because the selector will return undefined values until all internal values are successfully
      // loaded
      combineLatestWith(this.store.select(selectLoadedLayerCatalogueAndShareItem)),
      filter(([_, value]) => value !== undefined),
      take(1),
      map(([_, value]) => {
        return ShareLinkActions.validateItem({item: value!.shareLinkItem});
      }),
    );
  });

  public validateShareLinkItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.validateItem),
      map(({item}) => {
        const mapRestoreItem = this.shareLinkService.createMapRestoreItem(item);
        return ShareLinkActions.completeValidation({mapRestoreItem});
      }),
      catchError((error: unknown) => of(ShareLinkActions.setValidationError({error}))),
    );
  });

  public handleValidationError$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.setValidationError),
      map(({error}) => {
        return ShareLinkActions.setInitializationError({error});
      }),
    );
  });

  public throwInitializationError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ShareLinkActions.setInitializationError),
        concatLatestFrom(() => this.store.select(selectIsAuthenticated)),
        tap(([{error}, isAuthenticated]) => {
          throw new ShareLinkCouldNotBeValidated(isAuthenticated, error);
        }),
      );
    },
    {dispatch: false},
  );

  public setMapConfigAfterValidation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.completeValidation),
      map(({mapRestoreItem}) => {
        return MapConfigActions.setInitialMapConfig({
          x: mapRestoreItem.x,
          y: mapRestoreItem.y,
          scale: mapRestoreItem.scale,
          basemapId: mapRestoreItem.basemapId,
          initialMaps: [], // active map items are added in a separate effect
        });
      }),
    );
  });

  public setActiveMapItemsAfterValidation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.completeValidation),
      map(({mapRestoreItem}) => {
        return ActiveMapItemActions.addInitialMapItems({initialMapItems: mapRestoreItem.activeMapItems});
      }),
    );
  });

  public setInitialDrawingsAfterValidation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.completeValidation),
      map(({mapRestoreItem}) => {
        return DrawingActions.addDrawings({drawings: mapRestoreItem.drawings});
      }),
    );
  });

  public completeInitialization$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.completeValidation),
      combineLatestWith(this.store.select(selectItems), this.store.select(selectDrawings)),
      // ensure that the active map items and initial drawings have been set before continuing
      filter(
        ([{mapRestoreItem}, activeMapItems, drawings]) =>
          mapRestoreItem.activeMapItems.length === activeMapItems.length && mapRestoreItem.drawings.length === drawings.length,
      ),
      take(1),
      map(() => {
        return ShareLinkActions.completeApplicationInitialization();
      }),
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly shareLinkService: Gb3ShareLinkService,
    private readonly store: Store,
  ) {}
}
