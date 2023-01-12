import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {EsriMapService} from '../../../../map/services/esri-map.service';
import {tap} from 'rxjs';

@Injectable()
export class ActiveMapItemEffects {
  public dispatchActiveMapItemAddEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.addActiveMapItem),
        tap((action) => {
          if (action.layer) {
            // add single layer
            this.mapService.addTopicLayer(action.topic, action.layer);
          } else {
            // add whole topic
            this.mapService.addTopic(action.topic);
          }
        })
      );
    },
    {dispatch: false}
  );

  public dispatchActiveMapItemRemoveEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.removeActiveMapItem),
        tap((action) => {
          if (action.layer) {
            // remove single layer
            this.mapService.removeTopicLayer(action.topic, action.layer);
          } else {
            // remove whole topic
            this.mapService.removeTopic(action.topic);
          }
        })
      );
    },
    {dispatch: false}
  );

  public dispatchActiveMapItemClearEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.removeAllActiveMapItems),
        tap((action) => {
          this.mapService.removeAllTopics();
        })
      );
    },
    {dispatch: false}
  );

  constructor(private readonly actions$: Actions, private readonly mapService: EsriMapService) {}
}
