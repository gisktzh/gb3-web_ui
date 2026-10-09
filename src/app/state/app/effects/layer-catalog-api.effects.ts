import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {Store} from '@ngrx/store';
import {catchError, iif, map, of, switchMap} from 'rxjs';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {TopicsCouldNotBeLoaded} from '../../../shared/errors/map.errors';
import {LayerCatalogActions} from '../../map/actions/layer-catalog.actions';
import {selectItems} from '../../map/reducers/layer-catalog.reducer';

// Catalogue data is also needed by homepage search, without a map runtime.
@Injectable()
export class LayerCatalogApiEffects {
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
}
