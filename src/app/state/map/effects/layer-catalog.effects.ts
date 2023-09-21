import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {iif, of, switchMap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {selectMaps} from '../selectors/maps.selector';
import {Store} from '@ngrx/store';
import {selectMapConfigState} from '../reducers/map-config.reducer';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {selectItems} from '../reducers/layer-catalog.reducer';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';

import {TopicsCouldNotBeLoaded} from '../../../shared/errors/map.errors';

@Injectable()
export class LayerCatalogEffects {
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
      ofType(LayerCatalogActions.setLayerCatalog),
      // get latest maps only (so we don't have to loop through the whole catalog), add the current mapconfiguration
      concatLatestFrom(() => [this.store.select(selectMaps), this.store.select(selectMapConfigState)]),
      // create an array of ActiveMapItems for each id in the initialMaps configuration that has a matching map in the layer catalog
      map(([_, availableMaps, {initialMaps}]) => {
        const initialMapItems = availableMaps
          .filter((availableMap) => initialMaps.includes(availableMap.id))
          .map((availableMap) => ActiveMapItemFactory.createGb2WmsMapItem(availableMap));
        return ActiveMapItemActions.addInitialMapItems({initialMapItems});
      }),
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly topicsService: Gb3TopicsService,
    private readonly store: Store,
  ) {}
}
