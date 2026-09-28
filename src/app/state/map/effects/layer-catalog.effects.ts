import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {filter, map} from 'rxjs';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {selectMaps} from '../selectors/maps.selector';
import {Store} from '@ngrx/store';
import {selectMapConfigState} from '../reducers/map-config.reducer';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';

import {InitialMapIdsParameterInvalid, InitialMapsCouldNotBeLoaded} from '../../../shared/errors/initial-maps.errors';
import {selectIsAuthenticated} from '../../auth/reducers/auth-status.reducer';

@Injectable()
export class LayerCatalogEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

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
