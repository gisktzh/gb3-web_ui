import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {catchError, filter, iif, map, of, switchMap} from 'rxjs';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {selectMaps} from '../selectors/maps.selector';
import {Store} from '@ngrx/store';
import {selectMapConfigState} from '../reducers/map-config.reducer';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {selectItems} from '../reducers/layer-catalog.reducer';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';

import {TopicsCouldNotBeLoaded} from '../../../shared/errors/map.errors';
import {InitialMapIdsParameterInvalid, InitialMapsCouldNotBeLoaded} from '../../../shared/errors/initial-maps.errors';
import {selectIsAuthenticated} from '../../auth/reducers/auth-status.reducer';

@Injectable()
export class LayerCatalogEffects {
  private readonly actions$ = inject(Actions);
  private readonly topicsService = inject(Gb3TopicsService);
  private readonly store = inject(Store);

  public requestLayerCatalog$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LayerCatalogActions.loadLayerCatalog),
      concatLatestFrom(() => [this.store.select(selectItems)]),
      switchMap(([_, items]) =>
        // If we already have a layerCatalog, we set this as the current state, else we fetch the api. This is required to also trigger
        // the initialMapLoad and thus set initialMaps.
        iif(
          () => items.length > 0,
          of(LayerCatalogActions.setLayerCatalog({items})),
          this.topicsService.loadTopics().pipe(
            map((layerCatalogTopicResponse) => {
              return LayerCatalogActions.setLayerCatalog({items: layerCatalogTopicResponse.topics});
            }),
            catchError((err: unknown) => {
              throw new TopicsCouldNotBeLoaded(err);
            }),
          ),
        ),
      ),
    );
  });

  public handleInitialMapLoad = createEffect(() => {
    return this.actions$.pipe(
      ofType(LayerCatalogActions.setLayerCatalog, MapConfigActions.setInitialMapConfig),
      // get latest maps only (so we don't have to loop through the whole catalog), add the current mapconfiguration
      concatLatestFrom(() => [this.store.select(selectMaps), this.store.select(selectMapConfigState)]),
      // only proceed if both the layer catalog and initialMaps are available
      filter(([_, availableMaps, {initialMaps}]) => availableMaps.length > 0 && initialMaps.length > 0),
      // create an array of ActiveMapItems for each id in the initialMaps configuration that has a matching map in the layer catalog
      // the map-config reducer reacts to both addInitialMapItems and setInitialMapsError by clearing initialMaps,
      // preventing double-firing when both triggers arrive close together
      map(([_, availableMaps, {initialMaps}]) => {
        try {
          const initialMapItems = initialMaps.map((initialMap) => {
            const actualAvailableMap = availableMaps.find((availableMap) => availableMap.id === initialMap);
            if (!actualAvailableMap) {
              throw new InitialMapIdsParameterInvalid(initialMap);
            }
            return ActiveMapItemFactory.createGb2WmsMapItem(actualAvailableMap);
          });

          return ActiveMapItemActions.addInitialMapItems({initialMapItems});
        } catch (error: unknown) {
          return LayerCatalogActions.setInitialMapsError({error});
        }
      }),
    );
  });

  public setErrorForInvalidInitialMapIds$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(LayerCatalogActions.setInitialMapsError),
        concatLatestFrom(() => this.store.select(selectIsAuthenticated)),
        map(([{error}, isAuthenticated]) => {
          throw new InitialMapsCouldNotBeLoaded(isAuthenticated, error);
        }),
      );
    },
    {dispatch: false},
  );
}
