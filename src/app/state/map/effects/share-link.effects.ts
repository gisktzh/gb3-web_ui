import {ErrorHandler, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
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
import {MapConfigActions} from '../actions/map-config.actions';
import {
  ShareLinkCouldNotBeLoaded,
  ShareLinkCouldNotBeValidated,
  ShareLinkItemCouldNotBeCreated,
  ShareLinkPropertyCouldNotBeValidated,
} from '../../../shared/errors/share-link.errors';
import {selectLoadedLayerCatalogueAndShareItem} from '../selectors/loaded-layer-catalogue-and-share-item.selector';
import {selectItems} from '../reducers/active-map-item.reducer';
import {Gb3RuntimeError} from '../../../shared/errors/abstract.errors';
import {AuthService} from '../../../auth/auth.service';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';
import {SymbolizationToGb3ConverterUtils} from '../../../shared/utils/symbolization-to-gb3-converter.utils';
import {MapConstants} from '../../../shared/constants/map.constants';
import {Gb3StyledInternalDrawingRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {DrawingActions} from '../actions/drawing.actions';
import {selectDrawings} from '../reducers/drawing.reducer';

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
      // we can't use `concatLatestFrom` here because the selector will return undefined values until all internal values are successfully
      // loaded
      combineLatestWith(this.store.select(selectLoadedLayerCatalogueAndShareItem)),
      filter(([_, value]) => value !== undefined),
      take(1),
      map(([_, value]) => {
        return ShareLinkActions.validateItem({item: value!.shareLinkItem, topics: value!.topics});
      }),
    );
  });

  public validateShareLinkItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.validateItem),
      map((value) => {
        // validate basemap
        const basemapId = this.basemapConfigService.checkBasemapIdOrGetDefault(value.item.basemapId);
        if (basemapId !== value.item.basemapId) {
          throw new ShareLinkPropertyCouldNotBeValidated(`Basemap ist ungültig: '${value.item.basemapId}'`);
        }

        // validate scale
        const scale = value.item.scale;
        const maxScale = this.configService.mapConfig.mapScaleConfig.maxScale;
        const minScale = this.configService.mapConfig.mapScaleConfig.minScale;
        if (scale > minScale || scale < maxScale) {
          throw new ShareLinkPropertyCouldNotBeValidated(`Massstab ist ungültig: '${value.item.scale}'`);
        }

        // validate center => all values are allowed
        const center = {x: value.item.center.x, y: value.item.center.y};

        // validate active map items => validated within the favourite service
        const activeMapItems = this.favouritesService.getActiveMapItemsForFavourite(value.item.content);

        // extract drawing layers that are needed for the given favourite (i.e. they contain features)
        const drawingLayers: DrawingActiveMapItem[] = [];
        const drawingsToAdd: Gb3StyledInternalDrawingRepresentation[] = [];
        if (value.item.drawings.geojson.features.length > 0) {
          drawingLayers.push(ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, MapConstants.USER_DRAWING_LAYER_PREFIX));
          const drawings = SymbolizationToGb3ConverterUtils.convertExternalToInternalRepresentation(
            value.item.drawings,
            UserDrawingLayer.Drawings,
          );
          drawingsToAdd.push(...drawings);
        }
        if (value.item.measurements.geojson.features.length > 0) {
          drawingLayers.push(
            ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Measurements, MapConstants.USER_DRAWING_LAYER_PREFIX),
          );
          const drawings = SymbolizationToGb3ConverterUtils.convertExternalToInternalRepresentation(
            value.item.measurements,
            UserDrawingLayer.Measurements,
          );
          drawingsToAdd.push(...drawings);
        }

        // complete validation
        return ShareLinkActions.completeValidation({
          activeMapItems: [...drawingLayers, ...activeMapItems], // make sure drawings layers are added at the top
          scale,
          basemapId,
          drawings: drawingsToAdd,
          ...center,
        });
      }),
      catchError((error: unknown) => of(ShareLinkActions.setValidationError({error}))),
    );
  });

  public handleValidationError$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.setValidationError),
      concatLatestFrom(() => this.authService.isAuthenticated$),
      switchMap(([{error}, isAuthenticated]) => {
        const shareLinkCouldNotBeValidatedError =
          error instanceof Gb3RuntimeError
            ? new ShareLinkCouldNotBeValidated(error.message, isAuthenticated)
            : new ShareLinkCouldNotBeValidated('Unbekannter Fehler', isAuthenticated, error);
        return of(this.errorHandler.handleError(shareLinkCouldNotBeValidatedError)).pipe(map(() => shareLinkCouldNotBeValidatedError));
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
        return ActiveMapItemActions.initializeActiveMapItems({activeMapItems: value.activeMapItems});
      }),
    );
  });

  public setInitialDrawingsAfterValidation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.completeValidation),
      map((value) => {
        return DrawingActions.addDrawings({drawings: value.drawings});
      }),
    );
  });

  public completeInitialization$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.completeValidation),
      combineLatestWith(this.store.select(selectItems), this.store.select(selectDrawings)),
      // ensure that the active map items and initial drawings have been set before continuing
      filter(
        ([value, activeMapItems, drawings]) =>
          value.activeMapItems.length === activeMapItems.length && value.drawings.length === drawings.length,
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
    private readonly basemapConfigService: BasemapConfigService,
    private readonly configService: ConfigService,
    private readonly favouritesService: FavouritesService,
    private readonly errorHandler: ErrorHandler,
    private readonly authService: AuthService,
  ) {}
}
