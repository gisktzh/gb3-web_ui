import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, switchMap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';

@Injectable()
export class LayerCatalogEffects {
  public dispatchLayerCatalogRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LayerCatalogActions.loadLayerCatalog),
      switchMap(() =>
        this.topicsService.loadTopics().pipe(
          map((layerCatalogTopicResponse) => {
            return LayerCatalogActions.setLayerCatalog({layerCatalogItems: layerCatalogTopicResponse.layerCatalogItems});
          }),
          catchError(() => EMPTY)
        )
      )
    );
  });

  constructor(private readonly actions$: Actions, private readonly topicsService: Gb3TopicsService) {}
}
