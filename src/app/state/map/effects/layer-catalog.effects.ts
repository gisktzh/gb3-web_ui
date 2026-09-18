import {ErrorHandler, inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {catchError, filter, iif, map, of, switchMap} from 'rxjs';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {selectMaps} from '../selectors/maps.selector';
import {Store} from '@ngrx/store';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {selectItems, selectPendingInitialTopicIds} from '../reducers/layer-catalog.reducer';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';

import {TopicsCouldNotBeLoaded} from '../../../shared/errors/map.errors';
import {SomeTopicsCouldNotBeLoaded} from '../../../shared/errors/initial-maps.errors';

@Injectable()
export class LayerCatalogEffects {
  private readonly actions$ = inject(Actions);
  private readonly topicsService = inject(Gb3TopicsService);
  private readonly store = inject(Store);
  private readonly errorHandler = inject(ErrorHandler);

  public requestLayerCatalog$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LayerCatalogActions.loadLayerCatalog),
      concatLatestFrom(() => [this.store.select(selectItems)]),
      switchMap(([_, items]) =>
        // If we already have a layerCatalog, we set this as the current state, else we fetch the api. This is required to also trigger
        // the initial topic load.
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

  public handleInitialTopicLoad$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LayerCatalogActions.setLayerCatalog, LayerCatalogActions.setInitialTopics),
      concatLatestFrom(() => [this.store.select(selectMaps), this.store.select(selectPendingInitialTopicIds)]),
      filter(([, availableMaps, pendingTopicIds]) => availableMaps.length > 0 && pendingTopicIds !== undefined),
      map(([, availableMaps, pendingTopicIds]) => {
        const requestedTopicIds = pendingTopicIds ?? [];
        const invalidTopicIds = requestedTopicIds.filter((topicId) => !availableMaps.some((availableMap) => availableMap.id === topicId));
        const initialMapItems = requestedTopicIds.flatMap((topicId) => {
          const availableMap = availableMaps.find((mapItem) => mapItem.id === topicId);
          return availableMap ? [ActiveMapItemFactory.createGb2WmsMapItem(availableMap)] : [];
        });

        if (invalidTopicIds.length > 0) {
          this.errorHandler.handleError(new SomeTopicsCouldNotBeLoaded(invalidTopicIds));
        }

        return ActiveMapItemActions.addInitialMapItems({initialMapItems});
      }),
    );
  });

  public clearInitialTopicsAfterLoad$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.addInitialMapItems),
      concatLatestFrom(() => this.store.select(selectPendingInitialTopicIds)),
      filter(([, pendingTopicIds]) => pendingTopicIds !== undefined),
      map(() => LayerCatalogActions.clearInitialTopics()),
    );
  });
}
