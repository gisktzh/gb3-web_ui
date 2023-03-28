import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, switchMap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {environment} from '../../../../environments/environment';
import {selectMaps} from '../selectors/maps.selector';
import {Store} from '@ngrx/store';
import {selectMapConfigState} from '../reducers/map-config.reducer';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';

@Injectable()
export class LayerCatalogEffects {
  public dispatchLayerCatalogRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LayerCatalogActions.loadLayerCatalog),
      switchMap(() =>
        this.topicsService.loadTopics().pipe(
          map((layerCatalogTopicResponse) => {
            return LayerCatalogActions.setLayerCatalog({layerCatalogItems: layerCatalogTopicResponse.topics});
          }),
          catchError((err: unknown) => {
            if (!environment.production) {
              console.error(err);
            }
            return EMPTY; // todo error handling
          })
        )
      )
    );
  });

  public dispatchInitialMapLoad = createEffect(() => {
    return this.actions$.pipe(
      ofType(LayerCatalogActions.setLayerCatalog),
      // switch to maps only so we don't have to loop through the whole catalog
      switchMap(() => {
        return this.store.select(selectMaps);
      }),
      // add the current mapconfiguration
      concatLatestFrom(() => [this.store.select(selectMapConfigState)]),
      // create an array of ActiveMapItems for each id in the initialMaps configuration that has a matching map in the layer catalog
      map(([availableMaps, {initialMaps}]) => {
        const initialMapItems = availableMaps
          .filter((availableMap) => initialMaps.includes(availableMap.id))
          .map((availableMap) => new ActiveMapItem(availableMap));

        return ActiveMapItemActions.addInitialMapItems({initialMapItems});
      })
    );
  });

  constructor(private readonly actions$: Actions, private readonly topicsService: Gb3TopicsService, private readonly store: Store) {}
}
